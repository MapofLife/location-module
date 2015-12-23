#!/usr/bin/python2.7
# -*- coding: utf-8 -*-
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import urlfetch
urlfetch.set_default_fetch_deadline(600)


import webapp2
import logging


import mol_assets
import ee

import json

import time



class MountainRegionHandler(webapp2.RequestHandler):
    def post(self,mode):
        self.result = {}

        constraints = (json.loads(self.request.body))

        if mode == 'map':
            image = self.getImage(constraints)
            self.result = self.getMap(image,constraints)
            self.writeResult()
        elif mode == 'area':
            image = self.getImage(constraints)
            self.result= self.getArea(image.mask(image),constraints)
            self.writeResult()
        elif mode == 'stats':
            stats = {}
            image = None
            for metric in ('tvz','ruggedness','elevation','slope'):
                constraints["palette"] = metric
                if image is None:
                    image = self.getImage(constraints).select([0],[metric])
                else:
                    image = image.addBands(self.getImage(constraints).select([0],[metric]))
                stats = self.getStats(image, constraints)
            self.result = ee.Feature(None).set(stats).getInfo()["properties"]
            self.writeResult()
        elif mode == 'download':
            #image = None
            #for metric in ('tvz','ruggedness','elevation','slope'):
            #    constraints["palette"] = metric
            #   if image is None:
            image = self.getImage(constraints).select([0],[constraints["palette"]]).toFloat()
            #   else:
            #       image = image.addBands(
            #           self.getImage(constraints).select([0],[metric]).toFloat())
            self.result = self.downloadImage(image, constraints)
            self.writeResult()
        else:
            self.getAll(constraints)

    def getImage(self, constraints):

        logging.info(json.dumps(constraints))

        regions = ee.Image("users/map-of-life/regional/gmba_mountains_finescale").add(ee.Image(1))
        tvz = ee.Image("users/map-of-life/environmental/gmba_tvz")
        ruggedness = ee.Image("users/map-of-life/environmental/tri_mi_GMTED2010_md_km1")
        slope = ee.Image("users/map-of-life/environmental/slope_mi_GMTED2010_md_km1")
        elevation = ee.Image(mol_assets.elevation)

        #canny = ee.Algorithms.CannyEdgeDetector(regions, 0.4, 0).multiply(255);
        #border = canny.distance(ee.Kernel.euclidean(1))


        if constraints["palette"] == "region":
            fill = regions
            #if constraints["region"]["type"] == 'global':
            #    fill = regions.unmask()
        elif constraints["palette"] == "tvz":
            fill = tvz #.mask(regions)
        elif constraints["palette"] == "treeline":
            fill = ee.Image(0).where(tvz.lte(3),1).where(tvz.gt(3),2) #.mask(regions)
        elif constraints["palette"] == "ruggedness":
            fill = ruggedness #.mask(regions)
        elif constraints["palette"] == "elevation":
            fill = elevation #.mask(regions)
        elif constraints["palette"] == "slope":
            fill = slope #.mask(regions)
        else:
            fill = regions

        if "slope" in constraints:
            de = constraints["slope"]
            logging.info('Applying slope %s' % de)
            fill = fill.mask(
                slope.gte(
                    float(de[0])).And(
                        slope.lte(
                            float(de[1]))))



        if "elevation" in constraints:
            de = constraints["elevation"]
            if float(de[0])<=50:
                de[0]=-500
            logging.info('Applying elevation %s' % de)
            fill = fill.mask(
                elevation.gte(
                    float(de[0])).And(
                        elevation.lte(
                            float(de[1]))))



        if "ruggedness" in constraints:
            logging.info("Applying ruggedness")
            re = constraints["ruggedness"]
            fill = fill.mask(
                ruggedness.gte(
                    float(re[0])).And(
                        ruggedness.lte(
                            float(re[1]))))

        if "tvz" in constraints:
            logging.info("Applying tvz")
            tvzMask = ee.Image(0)
            for c in constraints["tvz"]:
                if c:
                    logging.info(c)
                    tvzMask = tvzMask.where(tvz.eq(int(c)),1)
            tvzMask = tvzMask.mask(tvzMask)
            fill = fill.mask(tvzMask)
            #fill = fill.mask(fill)



        if "regions" in constraints and constraints["region"]["type"]<>"global":
            if len(constraints["regions"])>0:
                logging.info("making regionMask")
                regionMask = ee.Image(0)
                for region in constraints["regions"]:
                    logging.info("Applying id")
                    logging.info("Region %s" % int(region["id"]))
                    regionMask = regionMask.where(regions.eq((int(region["id"])+1)),1)
                regionMask = regionMask.mask(regionMask)
                fill = fill.mask(regionMask)

        if constraints["region"]["type"]<>"global":
            logging.info("Clipping to regions")
            fill = fill.mask(regions.gt(1))

        fill = fill.mask(fill)

        return fill

    def getArea(self, image, constraints):

        stats = None
        #if "id" in constraints["region"]:

        geometry = ee.Geometry.Rectangle(
            ee.List([constraints["region"]["bounds"]["southWest"]["lng"],
            constraints["region"]["bounds"]["southWest"]["lat"],
            constraints["region"]["bounds"]["northEast"]["lng"],
            constraints["region"]["bounds"]["northEast"]["lat"]]),
            "EPSG:4326",
            False
        )

        for t in range(0,5):
            try:
                time.sleep((pow(2,t)-1)*2)
                stats = {"stats":{"area" : ee.Image.pixelArea().mask(image).reduceRegion(
                    reducer = ee.Reducer.sum(),
                    geometry = geometry,
                    maxPixels = 1e18,
                    scale = 1000,
                    bestEffort=False
                ).getInfo()["area"]/1000000}}
            except Exception as e:
                logging.info(e)
                logging.info("Retry in %s" % (time.sleep((pow(2,(t+1))-1)*2)))
            else:
                break

        return stats

    def getStats(self, image, constraints):

            minMax = None

            if constraints["region"]["type"] <> "global" and len(constraints["regions"])>0:
                geometry = ee.Geometry.Rectangle(
                    ee.List([constraints["region"]["bounds"]["southWest"]["lng"],
                    constraints["region"]["bounds"]["southWest"]["lat"],
                    constraints["region"]["bounds"]["northEast"]["lng"],
                    constraints["region"]["bounds"]["northEast"]["lat"]]),
                    "EPSG:4326",
                    False
                )
                scale = 1000
            else:
                geometry = ee.Geometry.Rectangle(
                    ee.List([-180,-90,180,90]),
                    "EPSG:4326",
                    False
                )
                scale = 10000

            for t in range(0,5):
                try:
                    time.sleep((pow(2,t)-1)*2)
                    minMax = ee.Image.pixelArea().mask(image.select([0])).addBands(image).reduceRegion(
                        reducer = ee.Reducer.sum().setOutputs(['area']).combine(
                            ee.Reducer.minMax(),'tvz_').combine(
                            ee.Reducer.minMax(),'ruggedness_').combine(
                            ee.Reducer.minMax(),'elevation_').combine(
                            ee.Reducer.minMax(),'slope_'),
                        geometry = geometry,
                        maxPixels = 1e18,
                        scale=scale,
                        bestEffort=True
                    )
                except Exception as e:
                    logging.info(e)
                    logging.info("Retry in %s" % (time.sleep((pow(2,(t+1))-1)*2)))
                else:
                    break

            return minMax

    def getMap(self, image, constraints):
        coolhot = "0500ff,0400ff,0300ff,0200ff,0100ff,0000ff,0002ff,0012ff,0022ff,0032ff,0044ff,0054ff,0064ff,0074ff,0084ff,0094ff,00a4ff,00b4ff,00c4ff,00d4ff,00e4ff,00fff4,00ffd0,00ffa8,00ff83,00ff5c,00ff36,00ff10,17ff00,3eff00,65ff00,8aff00,b0ff00,d7ff00,fdff00,FFfa00,FFf000,FFe600,FFdc00,FFd200,FFc800,FFbe00,FFb400,FFaa00,FFa000,FF9600,FF8c00,FF8200,FF7800,FF6e00,FF6400,FF5a00,FF5000,FF4600,FF3c00,FF3200,FF2800,FF1e00,FF1400,FF0a00,FF0000,FF0010,FF0020,FF0030,FF0040,FF0050,FF0060,FF0070,FF0080,FF0090,FF00A0,FF00B0,FF00C0,FF00D0,FF00E0,FF00F0,FF01F0,FF02F0,FF03F0,FF04F0,FF05F0,FF06F0,FF07F0,FF08F0,FF09F0,FF0AF0,FF0BF0,FF0CF0,FF0DF0,FF0EF0"
        visParams = {
            "region" : {
                "opacity":0.7,
                "min":1,"max":978,
                "palette":"cdc0b0,ff0000,ff0100,ff0300,ff0400,ff0600,ff0700,ff0900,ff0a00,ff0c00,ff0e00,ff0f00,ff1100,ff1200,ff1400,ff1500,ff1700,ff1900,ff1a00,ff1c00,ff1d00,ff1f00,ff2000,ff2200,ff2400,ff2500,ff2700,ff2800,ff2a00,ff2b00,ff2d00,ff2e00,ff3000,ff3200,ff3300,ff3500,ff3600,ff3800,ff3900,ff3b00,ff3d00,ff3e00,ff4000,ff4100,ff4300,ff4400,ff4600,ff4800,ff4900,ff4b00,ff4c00,ff4e00,ff4f00,ff5100,ff5200,ff5400,ff5600,ff5700,ff5900,ff5a00,ff5c00,ff5d00,ff5f00,ff6100,ff6200,ff6400,ff6500,ff6700,ff6800,ff6a00,ff6c00,ff6d00,ff6f00,ff7000,ff7200,ff7300,ff7500,ff7700,ff7800,ff7a00,ff7b00,ff7d00,ff7e00,ff8000,ff8100,ff8300,ff8500,ff8600,ff8800,ff8900,ff8b00,ff8c00,ff8e00,ff9000,ff9100,ff9300,ff9400,ff9600,ff9700,ff9900,ff9b00,ff9c00,ff9e00,ff9f00,ffa100,ffa200,ffa400,ffa500,ffa700,ffa900,ffaa00,ffac00,ffad00,ffaf00,ffb000,ffb200,ffb400,ffb500,ffb700,ffb800,ffba00,ffbb00,ffbd00,ffbf00,ffc000,ffc200,ffc300,ffc500,ffc600,ffc800,ffca00,ffcb00,ffcd00,ffce00,ffd000,ffd100,ffd300,ffd400,ffd600,ffd800,ffd900,ffdb00,ffdc00,ffde00,ffdf00,ffe100,ffe300,ffe400,ffe600,ffe700,ffe900,ffea00,ffec00,ffee00,ffef00,fff100,fff200,fff400,fff500,fff700,fff800,fffa00,fffc00,fffd00,feff00,fdff00,fbff00,faff00,f8ff00,f6ff00,f5ff00,f3ff00,f2ff00,f0ff00,efff00,edff00,ebff00,eaff00,e8ff00,e7ff00,e5ff00,e4ff00,e2ff00,e0ff00,dfff00,ddff00,dcff00,daff00,d9ff00,d7ff00,d6ff00,d4ff00,d2ff00,d1ff00,cfff00,ceff00,ccff00,cbff00,c9ff00,c7ff00,c6ff00,c4ff00,c3ff00,c1ff00,c0ff00,beff00,bcff00,bbff00,b9ff00,b8ff00,b6ff00,b5ff00,b3ff00,b2ff00,b0ff00,aeff00,adff00,abff00,aaff00,a8ff00,a7ff00,a5ff00,a3ff00,a2ff00,a0ff00,9fff00,9dff00,9cff00,9aff00,98ff00,97ff00,95ff00,94ff00,92ff00,91ff00,8fff00,8dff00,8cff00,8aff00,89ff00,87ff00,86ff00,84ff00,83ff00,81ff00,7fff00,7eff00,7cff00,7bff00,79ff00,78ff00,76ff00,74ff00,73ff00,71ff00,70ff00,6eff00,6dff00,6bff00,69ff00,68ff00,66ff00,65ff00,63ff00,62ff00,60ff00,5fff00,5dff00,5bff00,5aff00,58ff00,57ff00,55ff00,54ff00,52ff00,50ff00,4fff00,4dff00,4cff00,4aff00,49ff00,47ff00,45ff00,44ff00,42ff00,41ff00,3fff00,3eff00,3cff00,3aff00,39ff00,37ff00,36ff00,34ff00,33ff00,31ff00,30ff00,2eff00,2cff00,2bff00,29ff00,28ff00,26ff00,25ff00,23ff00,21ff00,20ff00,1eff00,1dff00,1bff00,1aff00,18ff00,16ff00,15ff00,13ff00,12ff00,10ff00,0fff00,0dff00,0cff00,0aff00,08ff00,07ff00,05ff00,04ff00,02ff00,01ff00,00ff00,00ff02,00ff03,00ff05,00ff06,00ff08,00ff09,00ff0b,00ff0d,00ff0e,00ff10,00ff11,00ff13,00ff14,00ff16,00ff18,00ff19,00ff1b,00ff1c,00ff1e,00ff1f,00ff21,00ff22,00ff24,00ff26,00ff27,00ff29,00ff2a,00ff2c,00ff2d,00ff2f,00ff31,00ff32,00ff34,00ff35,00ff37,00ff38,00ff3a,00ff3c,00ff3d,00ff3f,00ff40,00ff42,00ff43,00ff45,00ff46,00ff48,00ff4a,00ff4b,00ff4d,00ff4e,00ff50,00ff51,00ff53,00ff55,00ff56,00ff58,00ff59,00ff5b,00ff5c,00ff5e,00ff60,00ff61,00ff63,00ff64,00ff66,00ff67,00ff69,00ff6b,00ff6c,00ff6e,00ff6f,00ff71,00ff72,00ff74,00ff75,00ff77,00ff79,00ff7a,00ff7c,00ff7d,00ff7f,00ff80,00ff82,00ff84,00ff85,00ff87,00ff88,00ff8a,00ff8b,00ff8d,00ff8f,00ff90,00ff92,00ff93,00ff95,00ff96,00ff98,00ff99,00ff9b,00ff9d,00ff9e,00ffa0,00ffa1,00ffa3,00ffa4,00ffa6,00ffa8,00ffa9,00ffab,00ffac,00ffae,00ffaf,00ffb1,00ffb3,00ffb4,00ffb6,00ffb7,00ffb9,00ffba,00ffbc,00ffbe,00ffbf,00ffc1,00ffc2,00ffc4,00ffc5,00ffc7,00ffc8,00ffca,00ffcc,00ffcd,00ffcf,00ffd0,00ffd2,00ffd3,00ffd5,00ffd7,00ffd8,00ffda,00ffdb,00ffdd,00ffde,00ffe0,00ffe2,00ffe3,00ffe5,00ffe6,00ffe8,00ffe9,00ffeb,00ffec,00ffee,00fff0,00fff1,00fff3,00fff4,00fff6,00fff7,00fff9,00fffb,00fffc,00fffe,00feff,00fcff,00fbff,00f9ff,00f7ff,00f6ff,00f4ff,00f3ff,00f1ff,00f0ff,00eeff,00ecff,00ebff,00e9ff,00e8ff,00e6ff,00e5ff,00e3ff,00e2ff,00e0ff,00deff,00ddff,00dbff,00daff,00d8ff,00d7ff,00d5ff,00d3ff,00d2ff,00d0ff,00cfff,00cdff,00ccff,00caff,00c8ff,00c7ff,00c5ff,00c4ff,00c2ff,00c1ff,00bfff,00beff,00bcff,00baff,00b9ff,00b7ff,00b6ff,00b4ff,00b3ff,00b1ff,00afff,00aeff,00acff,00abff,00a9ff,00a8ff,00a6ff,00a4ff,00a3ff,00a1ff,00a0ff,009eff,009dff,009bff,0099ff,0098ff,0096ff,0095ff,0093ff,0092ff,0090ff,008fff,008dff,008bff,008aff,0088ff,0087ff,0085ff,0084ff,0082ff,0080ff,007fff,007dff,007cff,007aff,0079ff,0077ff,0075ff,0074ff,0072ff,0071ff,006fff,006eff,006cff,006bff,0069ff,0067ff,0066ff,0064ff,0063ff,0061ff,0060ff,005eff,005cff,005bff,0059ff,0058ff,0056ff,0055ff,0053ff,0051ff,0050ff,004eff,004dff,004bff,004aff,0048ff,0046ff,0045ff,0043ff,0042ff,0040ff,003fff,003dff,003cff,003aff,0038ff,0037ff,0035ff,0034ff,0032ff,0031ff,002fff,002dff,002cff,002aff,0029ff,0027ff,0026ff,0024ff,0022ff,0021ff,001fff,001eff,001cff,001bff,0019ff,0018ff,0016ff,0014ff,0013ff,0011ff,0010ff,000eff,000dff,000bff,0009ff,0008ff,0006ff,0005ff,0003ff,0002ff,0000ff,0100ff,0200ff,0400ff,0500ff,0700ff,0800ff,0a00ff,0c00ff,0d00ff,0f00ff,1000ff,1200ff,1300ff,1500ff,1600ff,1800ff,1a00ff,1b00ff,1d00ff,1e00ff,2000ff,2100ff,2300ff,2500ff,2600ff,2800ff,2900ff,2b00ff,2c00ff,2e00ff,3000ff,3100ff,3300ff,3400ff,3600ff,3700ff,3900ff,3a00ff,3c00ff,3e00ff,3f00ff,4100ff,4200ff,4400ff,4500ff,4700ff,4900ff,4a00ff,4c00ff,4d00ff,4f00ff,5000ff,5200ff,5400ff,5500ff,5700ff,5800ff,5a00ff,5b00ff,5d00ff,5f00ff,6000ff,6200ff,6300ff,6500ff,6600ff,6800ff,6900ff,6b00ff,6d00ff,6e00ff,7000ff,7100ff,7300ff,7400ff,7600ff,7800ff,7900ff,7b00ff,7c00ff,7e00ff,7f00ff,8100ff,8300ff,8400ff,8600ff,8700ff,8900ff,8a00ff,8c00ff,8d00ff,8f00ff,9100ff,9200ff,9400ff,9500ff,9700ff,9800ff,9a00ff,9c00ff,9d00ff,9f00ff,a000ff,a200ff,a300ff,a500ff,a700ff,a800ff,aa00ff,ab00ff,ad00ff,ae00ff,b000ff,b200ff,b300ff,b500ff,b600ff,b800ff,b900ff,bb00ff,bc00ff,be00ff,c000ff,c100ff,c300ff,c400ff,c600ff,c700ff,c900ff,cb00ff,cc00ff,ce00ff,cf00ff,d100ff,d200ff,d400ff,d600ff,d700ff,d900ff,da00ff,dc00ff,dd00ff,df00ff,e000ff,e200ff,e400ff,e500ff,e700ff,e800ff,ea00ff,eb00ff,ed00ff,ef00ff,f000ff,f200ff,f300ff,f500ff,f600ff,f800ff,fa00ff,fb00ff,fd00ff,fe00ff,ff00fd,ff00fc,ff00fa,ff00f8,ff00f7,ff00f5,ff00f4,ff00f2,ff00f1,ff00ef,ff00ee,ff00ec,ff00ea,ff00e9,ff00e7,ff00e6,ff00e4,ff00e3,ff00e1,ff00df,ff00de,ff00dc,ff00db,ff00d9,ff00d8,ff00d6,ff00d4,ff00d3,ff00d1,ff00d0,ff00ce,ff00cd,ff00cb,ff00ca,ff00c8,ff00c6,ff00c5,ff00c3,ff00c2,ff00c0,ff00bf,ff00bd,ff00bb,ff00ba,ff00b8,ff00b7,ff00b5,ff00b4,ff00b2,ff00b0,ff00af,ff00ad,ff00ac,ff00aa,ff00a9,ff00a7,ff00a5,ff00a4,ff00a2,ff00a1,ff009f,ff009e,ff009c,ff009b,ff0099,ff0097,ff0096,ff0094,ff0093,ff0091,ff0090,ff008e,ff008c,ff008b,ff0089,ff0088,ff0086,ff0085,ff0083,ff0081,ff0080,ff007e,ff007d,ff007b,ff007a,ff0078,ff0077,ff0075,ff0073,ff0072,ff0070,ff006f,ff006d,ff006c,ff006a,ff0068,ff0067,ff0065,ff0064,ff0062,ff0061,ff005f,ff005d,ff005c,ff005a,ff0059,ff0057,ff0056,ff0054,ff0052,ff0051,ff004f,ff004e,ff004c,ff004b,ff0049,ff0048,ff0046,ff0044,ff0043,ff0041,ff0040,ff003e,ff003d,ff003b,ff0039,ff0038,ff0036,ff0035,ff0033,ff0032,ff0030,ff002e,ff002d,ff002b,ff002a,ff0028,ff0027,ff0025,ff0024,ff0022,ff0020,ff001f,ff001d,ff001c,ff001a,ff0019,ff0017,ff0015,ff0014,ff0012,ff0011,ff000f,ff000e,ff000c,ff000a,ff0009,ff0007,ff0006,ff0004,ff0003,ff0001,ff0000,ff0100,ff0300,ff0400,ff0600,ff0700,ff0900,ff0a00,ff0c00,ff0e00,ff0f00,ff1100,ff1200,ff1400,ff1500,ff1700,ff1900,ff1a00,ff1c00,ff1d00,ff1f00,ff2000,ff2200"
            },
            "slope" : {
                "min":0,"max":2.2,
                "palette":coolhot
            },
            "binary" :  {
                "opacity":0.7,
                "min":0,"max":70,
                "palette":coolhot
            },
            "tvz" : {
                "opacity":0.7,
                "min":1,"max":7,
                "palette":"FFFFFF,00B1D7,4D35A1,00AF4A,00823E,FDDE16,FF8A11"
            },
            "treeline" : {
                "opacity":0.7,
                "min":1,"max":2,
                "palette":"e0dbbc,5f9b41"
            },
            "ruggedness" : {
                "opacity":0.7,
                "min":0,"max":4,
                "palette":coolhot
            },
            "elevation" : {
                "opacity":0.7,
                "min":0,"max":8500,
                "palette":coolhot
            }
        }

        if constraints["palette"] in ("ruggedness","slope"):
            image = image.log10()


        mapid = image.getMapId(visParams[constraints["palette"]])

        return {
            "token": mapid["token"],
            "id": mapid["mapid"]
        }
    def downloadImage(self, image, constraints):

        geometry = ee.Geometry.Rectangle(
            ee.List([constraints["region"]["bounds"]["southWest"]["lng"],
            constraints["region"]["bounds"]["southWest"]["lat"],
            constraints["region"]["bounds"]["northEast"]["lng"],
            constraints["region"]["bounds"]["northEast"]["lat"]]),
            "EPSG:4326",
            False
        )
        crsTransform = [
            0.0833333,
            0,
            constraints["region"]["bounds"]["southWest"]["lng"],
            0,
            -0.0833333,
            constraints["region"]["bounds"]["northEast"]["lat"]
        ]
        pixw=int((constraints["region"]["bounds"]["northEast"]["lng"]-
            constraints["region"]["bounds"]["southWest"]["lng"])/0.0833333)
        pixh=int((constraints["region"]["bounds"]["northEast"]["lat"]-
            constraints["region"]["bounds"]["southWest"]["lat"])/0.0833333)

        '''task = ee.batch.Export.image(
            image = image,
            description="Mountain region download",
            config = {
             'outputBucket':'mol-batch-output',
             'outputPrefix':'downloads/',
             #"crs":"EPSG:4326",
             "scale":1000,
             "maxPixels":1e12,
             #"crsTransform":crsTransform,
             #"dimensions":[pixw,pixh],
             "region":geometry.coordinates().getInfo(),
             "name":"region"})

        task.start()
        for i in range(0,100):
            time.sleep(3)
            status= task.status()
            if status["state"] in ("COMPLETED","FAILED"):
                break
        logging.info(status)'''

        for t in range(0,5):
            try:
                time.sleep((pow(2,t)-1)*2)
                url = image.getDownloadURL(params = {
                 "scale":1000,
                 "maxPixels":1e16,
                 "region":geometry.coordinates().getInfo(),
                 "name":constraints["regions"][0]["name"].replace(' ','_').replace("'","")}
                )
            except Exception as e:
                logging.info("trying to get download url try %s" % t)
            else:
                logging.info("Got download url try %s" % t)
                break


        return {"url":url}

    def handle_result(self,rpc):
        result = rpc.get_result()
        logging.info(self.result)
        logging.info(result.content)
        self.result.update(json.loads(result.content))
        self.done = self.done + 1
        if self.done >= len(self.rpcs):
            self.writeResult()


    def create_callback(self,rpc):
        return lambda: self.handle_result(rpc)

    def getAll(self,constraints):
        self.rpcs = []
        self.done = 0


        urls = ["/location/api/mountain_region/map","/location/api/mountain_region/stats"]
        for url in urls:
            rpc = urlfetch.create_rpc()
            rpc.callback = self.create_callback(rpc)
            urlfetch.make_fetch_call(
                rpc=rpc, url=self.request.host_url + url, payload=constraints)
            self.rpcs.append(rpc)

        for rpc in self.rpcs:
            rpc.wait()



    def writeResult(self):
        self.response.headers["Content-Type"] = "application/json"
        logging.info(self.result)
        self.response.out.write(json.dumps(self.result, ensure_ascii=False))


application = webapp2.WSGIApplication(
    [webapp2.Route(
        r'/location/api/mountain_region/<mode>',
        MountainRegionHandler)],
      debug=True)
