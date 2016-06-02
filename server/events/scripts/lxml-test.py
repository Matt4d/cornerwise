from lxml import html
import requests

#page = requests.get('http://somervillecityma.iqm2.com/Citizens/calendar.aspx')
with open('calendar.aspx', 'r') as filename:
    data = filename.read()


tree = html.fromstring(data)
dates = tree.xpath('//*[@id="ContentPlaceholder1_pnlMeetings"]/div/div[1]/div[2]/a/text()')
titles = tree.xpath('//*[@id="ContentPlaceholder1_pnlMeetings"]/div/div[1]/div[2]/a/@title')


y = [x.split('\r') for x in titles]

for z in y:
    print
    print '-'*5
    print
    for a in z:
        print a.strip()
