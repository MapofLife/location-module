#!/bin/bash
### http://web-tech.ga-usa.com/
### Sample Temperature Gradient by Dale Reagan
### 5/2012 - Originally generated for use with RRDTool
###
###
function show_values {
cat << EOL
RGB: 255,14,240 | Hex: FF0EF0
RGB: 255,13,240 | Hex: FF0DF0
RGB: 255,12,240 | Hex: FF0CF0
RGB: 255,11,240 | Hex: FF0BF0
RGB: 255,10,240 | Hex: FF0AF0
RGB: 255,9,240 | Hex: FF09F0
RGB: 255,8,240 | Hex: FF08F0
RGB: 255,7,240 | Hex: FF07F0
RGB: 255,6,240 | Hex: FF06F0
RGB: 255,5,240 | Hex: FF05F0
RGB: 255,4,240 | Hex: FF04F0
RGB: 255,3,240 | Hex: FF03F0
RGB: 255,2,240 | Hex: FF02F0
RGB: 255,1,240 | Hex: FF01F0
RGB: 255,0,240 | Hex: FF00F0
RGB: 255,0,224 | Hex: FF00E0
RGB: 255,0,208 | Hex: FF00D0
RGB: 255,0,192 | Hex: FF00C0
RGB: 255,0,176 | Hex: FF00B0
RGB: 255,0,160 | Hex: FF00A0
RGB: 255,0,144 | Hex: FF0090
RGB: 255,0,128 | Hex: FF0080
RGB: 255,0,112 | Hex: FF0070
RGB: 255,0,96 | Hex: FF0060
RGB: 255,0,80 | Hex: FF0050
RGB: 255,0,64 | Hex: FF0040
RGB: 255,0,48 | Hex: FF0030
RGB: 255,0,32 | Hex: FF0020
RGB: 255,0,16 | Hex: FF0010
RGB: 255,0,0 | Hex: FF0000
RGB: 255,10,0 | Hex: FF0a00
RGB: 255,20,0 | Hex: FF1400
RGB: 255,30,0 | Hex: FF1e00
RGB: 255,40,0 | Hex: FF2800
RGB: 255,50,0 | Hex: FF3200
RGB: 255,60,0 | Hex: FF3c00
RGB: 255,70,0 | Hex: FF4600
RGB: 255,80,0 | Hex: FF5000
RGB: 255,90,0 | Hex: FF5a00
RGB: 255,100,0 | Hex: FF6400
RGB: 255,110,0 | Hex: FF6e00
RGB: 255,120,0 | Hex: FF7800
RGB: 255,130,0 | Hex: FF8200
RGB: 255,140,0 | Hex: FF8c00
RGB: 255,150,0 | Hex: FF9600
RGB: 255,160,0 | Hex: FFa000
RGB: 255,170,0 | Hex: FFaa00
RGB: 255,180,0 | Hex: FFb400
RGB: 255,190,0 | Hex: FFbe00
RGB: 255,200,0 | Hex: FFc800
RGB: 255,210,0 | Hex: FFd200
RGB: 255,220,0 | Hex: FFdc00
RGB: 255,230,0 | Hex: FFe600
RGB: 255,240,0 | Hex: FFf000
RGB: 255,250,0 | Hex: FFfa00
RGB: 253,255,0 | Hex: fdff00
RGB: 215,255,0 | Hex: d7ff00
RGB: 176,255,0 | Hex: b0ff00
RGB: 138,255,0 | Hex: 8aff00
RGB: 101,255,0 | Hex: 65ff00
RGB: 62,255,0 | Hex: 3eff00
RGB: 23,255,0 | Hex: 17ff00
RGB: 0,255,16 | Hex: 00ff10
RGB: 0,255,54 | Hex: 00ff36
RGB: 0,255,92 | Hex: 00ff5c
RGB: 0,255,131 | Hex: 00ff83
RGB: 0,255,168 | Hex: 00ffa8
RGB: 0,255,208 | Hex: 00ffd0
RGB: 0,255,244 | Hex: 00fff4
RGB: 0,228,255 | Hex: 00e4ff
RGB: 0,212,255 | Hex: 00d4ff
RGB: 0,196,255 | Hex: 00c4ff
RGB: 0,180,255 | Hex: 00b4ff
RGB: 0,164,255 | Hex: 00a4ff
RGB: 0,148,255 | Hex: 0094ff
RGB: 0,132,255 | Hex: 0084ff
RGB: 0,116,255 | Hex: 0074ff
RGB: 0,100,255 | Hex: 0064ff
RGB: 0,84,255 | Hex: 0054ff
RGB: 0,68,255 | Hex: 0044ff
RGB: 0,50,255 | Hex: 0032ff
RGB: 0,34,255 | Hex: 0022ff
RGB: 0,18,255 | Hex: 0012ff
RGB: 0,2,255 | Hex: 0002ff
RGB: 0,0,255 | Hex: 0000ff
RGB: 1,0,255 | Hex: 0100ff
RGB: 2,0,255 | Hex: 0200ff
RGB: 3,0,255 | Hex: 0300ff
RGB: 4,0,255 | Hex: 0400ff
RGB: 5,0,255 | Hex: 0500ff
EOL
}
###
MAX=90
RGB_HEX="$1"
START="$2"
HEAD_TAIL="$3"

((LINES=MAX-START)) ## show XX number of lines
TAIL="tail -${LINES}"
HEAD="head -${LINES}"

case "${HEAD_TAIL}"
in
	head) HEAD_TAIL="${HEAD}" ;;
	tail) HEAD_TAIL="${TAIL}" ;;
	   *) HEAD_TAIL="${TAIL}" ;; ## use default
esac

printf "\n\t$0 - listing ${LINES} lines -  using '${HEAD_TAIL}'\n\n"
case "${RGB_HEX}"
in
	rgb) show_values | awk '{print $2}' | ${HEAD_TAIL} ;;
	hex) show_values | awk '{print $NF}' | ${HEAD_TAIL} ;;
	all) show_values | ${TAIL} ;;
	  *) printf "\n\tUsage: $0 {rgb, hex, all} [number-lines, {head, tail}]\n" ;;
esac
printf "\t##############\n"
