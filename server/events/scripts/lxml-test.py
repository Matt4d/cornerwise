from lxml import html
import requests

#page = requests.get('http://www.somervillema.gov/government/public-minutes')
with open('test.html', 'r') as filename:
    data = filename.read()

tree = html.fromstring(data)
titles = tree.xpath('/html/body/center/table/tbody/tr[2]/td/table/tbody/tr[1]/td[3]/table/tbody/tr[2]/td[1]/div/div[3]/table[2]/tbody/tr[1]/td[2]/a[@href]')

print titles




'''
y = [x.split('\r') for x in titles]

for z in y:
    print '\n{}\n'.format('-'*5)
    for a in z:
        print a.strip()
'''
#/html/body/center/table/tbody/tr[2]/td/table/tbody/tr[1]/td[3]/table/tbody/tr[2]/td[1]/div/div[3]/table[2]/tbody/tr[1]/td[2]

#/html/body/center/table/tbody/tr[2]/td/table/tbody/tr[1]/td[3]/table/tbody/tr[2]/td[1]/div/div[3]/table[2]/tbody/tr[2]/td[2]
