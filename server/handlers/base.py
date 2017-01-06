# A handler to render the index.html template for the MOL AngularJS SPA

from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

import logging
import os
import random
import webapp2

if 'SERVER_SOFTWARE' in os.environ:
    PROD = not os.environ['SERVER_SOFTWARE'].startswith('Development')
else:
   PROD = True

PROD = True

class BaseHandler(webapp2.RequestHandler):
    def render_template(self, f, template_args):
        path = os.path.join(os.path.dirname(__file__), "../templates/html", f)
        logging.info(template_args)
        self.response.out.write(template.render(path, template_args))

class App(BaseHandler):
    def get(self):
        self.render_template('index.html',{"prod":PROD,'rand':'010620171140'})
    def post(self):
        self.render_template('index.html',{"prod":PROD,'rand':'010620171140'})

application = webapp2.WSGIApplication(
         [
          ('/.*',App),
          ('/', App),
          ('/location',App),
          ('/location/.*',App),
          ])
