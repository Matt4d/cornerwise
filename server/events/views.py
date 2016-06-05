from django.http import HttpResponse
from django.shortcuts import render
from lxml import html
import requests

# Create your views here.
def index_test(req):
    #page = requests.get('http://somervillecityma.iqm2.com/Citizens/calendar.aspx')
    with open('/app/events/calendar.aspx', 'r') as filename:
        data = filename.read()
    tree = html.fromstring(data)
    events = tree.xpath('//*[@id="ContentPlaceholder1_pnlMeetings"]/div/div[1]/div[2]/a/@title')

    z = []

    # this split is required -- the list items get cut off otherwise
    a = [b.split('\r') for b in events]
    for c in a:
        z.append('\n{}\n'.format('-'*5))
        for d in c:
            z.append(d.split())

    return(HttpResponse(z))
