import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('widget-collection-dynamic-aggregation', 'Integration | Component | widget collection dynamic aggregation', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{widget-collection-dynamic-aggregation}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#widget-collection-dynamic-aggregation}}
      template block text
    {{/widget-collection-dynamic-aggregation}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
