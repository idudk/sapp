from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
from pymongo import MongoClient
from bson.json_util import dumps
import pymongo
import xmltodict
import json

#Parse and create db client
print("Opening db connection")
client = MongoClient('localhost',27017)
db = client.wiki
collection = db.entries
db.hist.drop()
history = db.hist
myfile = open('test.xml')
data = myfile.read()
print("Parsing xml file")
data = xmltodict.parse(data)

print("Populating Database")
for key,value in data['feed'].items():
    for entry in value:
        tempentry = {}
        tempentry['title'] = entry['title'][11:]
        tempentry['url'] = entry['url']
        tempentry['abstract'] = entry['abstract']
        collection.insert_one(tempentry)

#Create text index
collection.create_index(
    [
        ('title', 'text'),
        ('abstract','text')
    ],
    weights={
        'title': 100,
        'abstract': 1
    })

#Create and start flask backend
app = Flask(__name__)

#Get all query data
def getdata(cursor,query):
   return returndata



@app.route('/search', methods=["POST"])
def search():
    #Get POST data
    query = next(iter(request.form))
    print("GOT POST REQUEST: %s" % query)
    #Use $text to find w/ string match
    cursor = collection.find({
        "$text":
            {
                "$search": '\"' + query + '\"',
                "$caseSensitive": False,
                "$diacriticSensitive": False
            }
        }).sort("$text",1)
    #Check if cursor is alive
    if cursor.count() == 0:
        print("Nothing Found")
        emptydata = {}
        emptydata['foundcount'] = 0
        emptydata['query'] = query
        return json.dumps(emptydata)

    #Return title, abstract, and url in JSON format for all entries
    returndata = {}
    returndata['entries'] = []
    for element in cursor[:]:
        templist = []
        templist.append(element['title'])
        templist.append(element['url'])
        templist.append(element['abstract'])
        returndata['entries'].append(templist)
    #Record query found count
    returndata['foundcount'] = cursor.count()
    #Add query request into dict
    returndata['query'] = query
    return json.dumps(returndata)

@app.route('/get_hist')
def update_hist():
    hist_list = {}
    hist_list['hist'] = []
    for element in history.find()[:]:
        hist_list['hist'].append(element['hist'])
    if hist_list == {}:
        return ""
    else:
        return json.dumps(hist_list)

@app.route('/set_hist', methods=["POST"])
def insert_hist():
    #Add post request to history db
    print([a for a in request.values if a != []][0])
    history.insert_one({"hist":[a for a in request.values if a != []][0]})
    return ""

@app.route('/')
def index():
    return render_template('index.html')
