# Eureka-widget-collection-aggregation

Aggregate Eureka's collection data and display it via charts. Usage:

    {
        type: 'collection-aggregation',
        label: '',
        aggregation: {
            label: 'gender.title',
            avgWeight: {$avg: 'weightMeasurement'}
        },
        query: {
            taxonomy: 'mus-cookii'
        },
        options: {
            sort: 'name'
        },
        display: {
            as: 'column',
            x: label,
            y: avgWeight,
            // groupBy: 'taxonomy‘
        }

    }

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
