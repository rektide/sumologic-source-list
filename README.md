# Sumologic Collector List

This small command line utility provides a speedy way to search for SumoLogic sources by their (partial) name.

# Use

Install via npm, set SUMOLOGIC_USER, SUMOLOGIC_PASS & and SUMOLOGIC_COLLECTOR, then run `sumologic-collector-list` providing search terms to look for.

In the example below, we'll get any collectors that have 'testing' 'preprod' or 'performance' in their names:

```shell
sudo npm install -g sumologic-collector-list
export SUMOLOGIC_USER=[your username/api-user]
export SUMOLOGIC_PASS=[your pass/api-key]
export SUMOLOGIC_COLLECTOR=[friendly name of the collector to search within]
sumologic-collector-list testing preprod performance
```
