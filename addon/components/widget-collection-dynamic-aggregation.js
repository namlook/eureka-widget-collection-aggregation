import Ember from 'ember';
import CollectionWidget from 'ember-eureka/widget-collection';
import layout from '../templates/components/widget-collection-dynamic-aggregation';

export default CollectionWidget.extend({
    layout: layout,

    widgetConfig: null,


    xProperty: null,
    yProperty: null,
    colorProperty: null,
    xOperator: null,
    yOperator: null,
    chartType: 'line',
    sortByLabel: 'x',
    sortReversed: false,
    limit: 200,

    suggestedCharts: Ember.computed(function() {
        return Ember.A([
            {id: 'line', label: 'line'},
            {id: 'scatter', label: 'scatter'},
            {id: 'bar', label: 'bar'},
            {id: 'column', label: 'column'},
            {id: 'pie', label: 'pie'}
        ]);
    }),

    suggestedOerators: Ember.computed(function() {
        return Ember.A([
            {id: '$count', label: 'count'},
            {id: '$avg', label: 'average'},
            {id: '$min', label: 'min'},
            {id: '$max', label: 'max'}
        ]);
    }),

    generateConfig() {
        let xProperty = this.get('xProperty');
        let x = xProperty;
        let xOperator = this.get('xOperator');
        if (xOperator) {
            if (xOperator === '$count' && !xProperty) {
                xProperty = true;
            }
            x = {
                [xOperator]: xProperty
            };
        }

        let yProperty = this.get('yProperty');
        let y = yProperty;
        let yOperator = this.get('yOperator');
        if (yOperator) {
            if (yOperator === '$count' && !yProperty) {
                yProperty = true;
            }
            y = {
                [yOperator]: yProperty
            };
        }

        let colorProperty = this.get('colorProperty');


        let aggregator = {};
        if (x) {
            aggregator.x = x;
        }
        if (y) {
            aggregator.y = y;
        }
        if (colorProperty) {
            aggregator.color = colorProperty;
        }


        let chartType = this.get('chartType');

        let sortByLabel = this.get('sortByLabel');
        let options = {};

        if (sortByLabel) {
            if(this.get('sortReversed')) {
                sortByLabel = `-${sortByLabel}`;
            }

            options.sort = sortByLabel;
        }
        options.limit = this.get('limit');


        let config = {
            aggregator: aggregator,
            options: options,
            display: {
                as: chartType,
                x: 'x',
                y: 'y',
                color: 'color'
            }
        };

        console.log('config>>>', config);

        this.set('widgetConfig', config);
    },

    actions: {
        reload() {
            console.log('reload');
            this.generateConfig();
        }
    }
});
