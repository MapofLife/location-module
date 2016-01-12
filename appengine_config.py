from google.appengine.ext import vendor

# Add any libraries installed in the "lib" folder.
vendor.add('server/lib')

#import server.secrets.ee.config as config
#import mol_assets
import ee
import server.secrets.earthengine.config
