from datetime import datetime
from lxml import html
import requests

BASE_URL = 'http://www.somervillema.gov'

#page = requests.get('http://www.somervillema.gov/government/public-minutes')
with open('test.html', 'r') as filename:
    data = filename.read()
tree = html.fromstring(data)


def get_date(tr):
    xpath = ('/html/body/center/table/tbody/tr[2]/td/table/tbody/tr[1]/td[3]'
             '/table/tbody/tr[2]/td[1]/div/div[3]//tbody/tr[{}]/td[1]/span/text()'.format(tr))
    date = tree.xpath(xpath)

    return datetime.strptime(str(date[0]), "%b %d, %Y")


def get_link(tr):
    xpath = ('/html/body/center/table/tbody/tr[2]/td/table/tbody/tr[1]/td[3]'
             '/table/tbody/tr[2]/td[1]/div/div[3]//tbody/tr[{}]/td[2]/a/@href'.format(tr))
    value = tree.xpath(xpath)

    return value


i = 1
date_time = get_date(i)
while date_time > datetime.now():
    link = get_link(i)
    print "Incremented! Here: {} {}".format(date_time, link)
    print "New URL: {}".format(BASE_URL + link[0])

    i += 1
    date_time = get_date(i)
    
