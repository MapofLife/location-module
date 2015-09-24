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

PROD = False

class BaseHandler(webapp2.RequestHandler):
    def render_template(self, f, template_args):
        path = os.path.join(os.path.dirname(__file__), "server/templates/html", f)
        logging.info(path)

        template_args['debug']=(self.request.get('debug','false')=='true')
        self.response.out.write(template.render(path, template_args))

    def push_html(self, f):
        path = os.path.join(os.path.dirname(__file__), "server/templates/html", f)
        logging.info(path)
        self.response.out.write(open(path, 'r').read())

class App(BaseHandler):
    def get(self):
        self.render_template('index.html',{"prod":PROD,'rand':''})
    def post(self):
        self.render_template('index.html')

application = webapp2.WSGIApplication(
         [
          ('/.*',App),
          ('/', App)
          ],
         debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
