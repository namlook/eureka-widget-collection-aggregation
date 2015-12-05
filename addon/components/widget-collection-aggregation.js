import Ember from 'ember';
import CollectionWidget from 'ember-eureka/widget-collection';
import layout from '../templates/components/widget-collection-aggregation';

export default CollectionWidget.extend({
    layout: layout,

    label: Ember.computed.alias('config.label'),
    aggregator: Ember.computed.alias('config.aggregator'),
    options: Ember.computed.alias('config.options'),

    displayType : Ember.computed.alias('config.display.as'),
    displayAsNumber: Ember.computed('displayType', function() {
        return this.get('displayType') === 'number';
    }),
    number: null,

    chartHeight: Ember.computed.alias('config.display.height'),

    xLabel : Ember.computed('config.display.x', function() {
        let label = this.get('config.display.x');
        if (typeof label === 'string') {
            return label;
        }
        return this.get('config.display.x.as');
    }),

    xTitle : Ember.computed.alias('config.display.x.title'),
    xSuffix : Ember.computed.alias('config.display.x.suffix'),
    xSeries: Ember.computed('config.display.x', function() {
        let series = this.getWithDefault('config.display.x.series', []);
        if (!series.length) {
            let xConfig = this.get('config.display.x');
            let xConfigAs, xConfigName;
            if (typeof xConfig === 'string') {
                xConfigAs = xConfig;
            } else {
                xConfigAs = xConfig.as;
                xConfigName = xConfig.title;
            }
            series.push({
                as: xConfigAs,
                name: xConfigName
            });
        }
        return series;
    }),

    yLabel : Ember.computed('config.display.y', function() {
        let label = this.get('config.display.y');
        if (typeof label === 'string') {
            return label;
        }
        return this.get('config.display.y.as');
    }),

    yTitle : Ember.computed.alias('config.display.y.title'),
    ySuffix : Ember.computed.alias('config.display.y.suffix'),
    ySeries: Ember.computed('config.display.y', function() {
        let series = this.getWithDefault('config.display.y.series', []);
        if (!series.length) {
            let yConfig = this.get('config.display.y');
            let yConfigAs, yConfigName;
            if (typeof yConfig === 'string') {
                yConfigAs = yConfig;
            } else {
                yConfigAs = yConfig.as;
                yConfigName = yConfig.title;
            }
            series.push({
                as: yConfigAs,
                name: yConfigName
            });
        }
        return series;
    }),

    chartTitle: Ember.computed.alias('config.display.title'),
    chartSubtitle: Ember.computed.alias('config.display.subtitle'),


    chartMode: false,
    chartData: null,
    chartOptions: Ember.computed(
      'displayType',
      // 'chartCategories.[]',
      'chartTitle',
      'chartSubtitle',
      'xTitle', 'yTitle',
      'xSuffix', 'ySuffix',
      'color',
      'operator', function() {
        let chartType = this.get('displayType');
        // let chartCategories = this.get('chartCategories');
        let chartTitle = this.get('chartType') || '';
        let chartSubtitle = this.get('chartSubtitle') || '';
        let chartHeight = this.get('chartHeight');

        let xTitle = this.get('xTitle');
        let yTitle = this.get('yTitle');
        let xSuffix = this.get('xSuffix');
        let ySuffix = this.get('ySuffix');

        if (chartType === 'bar') {
            [xTitle, yTitle] = [yTitle, xTitle];
            [xSuffix, ySuffix] = [ySuffix, xSuffix];
        }

        return {
            chart: {
                type: chartType,
                height: chartHeight
            },
            title: {
              text: chartTitle
            },
            subtitle: {
              text: chartSubtitle
            },
            xAxis: {
                categories: [],//chartCategories,
                title: xTitle,
                labels: {
                    format: xSuffix && `{value}${xSuffix}` || '{value}'
                }
            },
            tooltip: {
                valueSuffix: ySuffix
            },
            legend: {
                labelFormatter: function() {
                    // if (chartType === 'pie') {
                    //     if (operator === 'count') {
                    //         return `${this.name} (${this.percentage.toFixed(1)}%)`;
                    //     } else {
                    //         return `${this.name} (${this.value}${valueSuffix})`;
                    //     }
                    // }
                    return this.name;
                }
            },
            // plotOptions: {
            //     pie: {
            //         allowPointSelect: true,
            //         cursor: 'pointer',
            //         dataLabels: {
            //             enabled: false
            //         },
            //         showInLegend: true
            //     }
            // },
            yAxis: {
                title: {
                  text: yTitle,
                  align: 'high'
                },
                gridLineInterpolation: 'polygon',
                labels: {
                    format: ySuffix && `{value}${ySuffix}` || '{value}'
                }
            }
        };
    }),

    // _chartData: Ember.computed('data.@each.value', 'serieName', function() {
    //     var serieName = this.get('serieName');
    //     var data = this.get('data').map(function(item) {
    //         return {
    //             name: item.label,
    //             y: item.value,
    //             selected: item.selected
    //         };
    //     });
    //     return [{
    //         name: serieName,
    //         data: data
    //     }];
    // }),

    /** update the collection from the `routeModel.query` */
    fetch: Ember.on('init', Ember.observer(
      'routeModel.query.hasChanged',
      'routeModel.meta',
      'store',
      'aggregator',
      'displayConfig',
      'singleValueRepresentation',
      'considerUnfilled', function() {

        this.set('isLoading', true);
        let routeQuery = this.get('routeModel.query')._toObject();

        let query = {};
        for (let fieldName of Object.keys(routeQuery)) {
            if (fieldName[0] === '_') {
                query[fieldName.slice(1)] = routeQuery[fieldName];
            } else {
                query.filter = query.filter || {};
                query.filter[fieldName] = routeQuery[fieldName];
            }
        }

        // if (this.get(`routeModel.meta.${property}Field.isRelation`)) {
        //     property = `${property}.title`;
        // }

        let store = this.get('store');

        let aggregator = this.get('aggregator');
        let options = this.get('options');

        let promises = Ember.A();
        promises.pushObject(store.aggregate(aggregator, query, options));

        // let considerUnfilled = this.get('considerUnfilled');
        // if (considerUnfilled) {
        //     let unfilledQuery = {};
        //     Ember.setProperties(unfilledQuery, query);
        //     unfilledQuery[property] = {'$exists': false};
        //     promises.pushObject(store.count(unfilledQuery));
        // }

        Ember.RSVP.all(promises).then((data) => {
            let results = data[0];
            if (this.get('displayAsNumber')) {
                if (results.length) {
                    this.set('number', parseInt(results[0].x, 10));
                } else {
                    this.set('number', null);
                }

            } else {

                // if (considerUnfilled) {
                //     results.push({label: '_unfilled', value: data[1], selected: true});
                // }

                // let xLabel = this.get('xLabel');
                // let yLabel = this.get('yLabel');
                // let series = this.get('ySeries');

                let displayType = this.get('displayType');

                // if (displayType === 'bar') {
                    // xLabel = this.get('yLabel');
                    // yLabel = this.get('xLabel');
                    // series = this.get('xSeries');
                // }

                // let chartCategories = results.mapBy(xLabel).uniq();

                let getPointCoordinates = function(item) {
                    if (typeof item.x === 'boolean') {
                        item.x = `${item.x}`;
                    }
                    if (typeof item.y === 'boolean') {
                        item.y = `${item.y}`;
                    }

                    if (displayType === 'bar') {
                        return [item.y, item.x];
                    }
                    return [item.x, item.y];
                };

                let chartData = [];

                if (this.get('aggregator.color')) {
                    let colorValues = results.mapBy('color').uniq();
                    for (let colorValue of colorValues) {
                        let filteredResults = results.filterBy('color', colorValue);
                        if (typeof colorValue === 'boolean') {
                            colorValue = `${colorValue}`;
                        }
                        chartData.push({
                            name: colorValue,
                            data: filteredResults.map(getPointCoordinates)
                        });
                    }
                } else {
                    chartData = [{
                        name: ' ',
                        data: results.map(getPointCoordinates)
                    }];
                }

                // if (displayType === 'pie') {
                //     let serie = series[0];
                //     chartData = [{
                //         name: serie.title,
                //         data: results.mapBy(serie.as).map((value, index) => {
                //             return {
                //                 name: chartCategories[index],
                //                 y: value
                //             };
                //         })
                //     }];

                // } else if (this.get('aggregator.color')) {

                //     chartData = [];
                //     for (let serie of series) {
                //         let colorValues = results.mapBy('color').uniq();
                //         let _data = {};

                //         for (let colorValue of colorValues) {
                //             _data[colorValue] = [];
                //         }

                //         for (let item of results) {
                //             for (let colorValue of colorValues) {
                //                 let val = null;
                //                 if (colorValue === item.color) {
                //                     val = item[serie.as];
                //                 }
                //                 _data[colorValue].push(val);
                //             }
                //         }

                //         for (let colorValue of Object.keys(_data)) {
                //             chartData.push({
                //                 name: colorValue,
                //                 data: _data[colorValue]
                //             });
                //         }
                //     }

                // } else {

                //     chartData = series.map((serie) => {
                //         return {
                //             name: serie.name,
                //             data: results.mapBy(serie.as)
                //         };
                //     });
                // }

                this.setProperties({
                    chartData: chartData
                    // chartCategories: chartCategories
                });
            }
            this.set('isLoading', false);
        });
    }))
});
