#!/usr/bin/env node
"use strict"

var fetch = require("node-fetch")

var
  apiUrl= process.env.SUMOLOGIC_URL || "api.us2.sumologic.com/api/v1/",
  user= process.env.SUMOLOGIC_USER,
  password= process.env.SUMOLOGIC_PASS,
  pageLimit= Number.parseInt(process.env.SUMOLOGIC_PAGE_LIMIT || 1000),
  pagesMax= Number.parseInt(process.env.SUMOLOGIC_PAGES_MAX || 50),
  collector = process.env.SUMOLOGIC_COLLECTOR

// initialize

if(isNaN(pageLimit) || isNaN(pagesMax)){
	throw new Error("Need a numeric argument")
}
if(!collector){
	throw new Error("Need a collector specified via env-var")
}
collector = new RegExp(collector)

process.on("uncaughtException", console.error)
process.on("unhandledRejection", console.error)

// retrieve all collectors, find our target one

function collectors(n){
	var url = "https://"+user+":"+password+"@"+apiUrl+"collectors?limit="+pageLimit+"&offset="+n
	return fetch(url)
}


var collectors = collectors(0) // get first page
var cookies = collectors.then(c => { // get session cookies
	return c.headers.getAll("set-cookie")
})
var targetCollector = collectors.then(c => c.json()).then(function(c){ // find the asked for collector
	for(var i in c.collectors){
		if(collector.test(c.collectors[i].name)){
			return c.collectors[i]
		}
	}
})

// retrieve all sources, find any whose name includes a command line argument

function sources(){ // get all sources using existing session
	return Promise.all([cookies, targetCollector]).then(function(args){
		var cookies = args[0],
		  collector = args[1],
		  url = "https://"+apiUrl+"collectors/"+collector.id+"/sources?limit="+pageLimit+"&offset=0",
		  headers = new (fetch.Headers)()
		for(var i in cookies){
			headers.append("cookie", cookies[i])
		}
		return fetch(url, {headers})
	})
}

function filterSourceList(s){ // filter the sources down and print out
	if(process.argv.length <= 2){
		console.log(JSON.stringify(s))
		return
	}

	var filters = process.argv.slice(2).map(a => new RegExp(a, "i"))
	function filter(s){
		for(var i in filters){ // see if name matches any argument
			if(filters[i].test(s.name))
				return true
		}
	}
	console.log(JSON.stringify(s.filter(filter)))
}

var sourceList = sources().then(s => s.json()).then(s => s.sources).then(filterSourceList)
