import Ember from 'ember';
import startApp from '../helpers/start-app';
import rowValuesEqual from '../helpers/row-values-equal';
import fillInByLabel from '../helpers/fill-in-by-label';

var App, server;
var offset;

module('Acceptance: Admin', {
  setup: function() {
    App = startApp();
    offset = 0;
    server = new Pretender(function() {
      this.get('/admin/cats', function(request) {
        var cats = [
          [
            { id: 1, name: "Felix", age: 10 },
            { id: 2, name: "Nyan",  age: 3  }
          ],
          [
            { id: 1, name: "Hobbes", age: 29 },
            { id: 2, name: "Nyan",   age: 3  }
          ],
          [
            { id: 1, name: "Hobbes", age: 29 },
            { id: 2, name: "Nyan",   age: 3  },
            { id: 3, name: "Lion-O", age: 30 }
          ],
          [
            { id: 2, name: "Nyan",   age: 3  },
          ]
        ];
        return [200, {"Content-Type": "application/json"}, JSON.stringify({cats: cats[offset]})];
      });
      this.get('/admin/cats/1', function(request) {
        var cats = [
          { id: 1, name: "Felix", age: 10 },
        ];
        return [200, {"Content-Type": "application/json"}, JSON.stringify({cats: cats})];
      });
      this.put('/admin/cats/1', function(request) {
        var cats = [
          { id: 1, name: "Hobbes", age: 29 },
        ];
        return [200, {"Content-Type": "application/json"}, JSON.stringify({cats: cats})];
      });
      this.post('/admin/cats', function(request) {
        var cats = [
          { id: 3, name: "Lion-O", age: 30 },
        ];
        return [200, {"Content-Type": "application/json"}, JSON.stringify({cats: cats})];
      });
      this.delete('/admin/cats/1', function(request) {
        return [204, {"Content-Type": "application/json"}, ''];
      });
    });
  },
  teardown: function() {
    Ember.run(App, 'destroy');
    server.shutdown();
  }
});

test('listing all models', function() {
  visit('/admin');

  andThen(function() {
    var links = find('a');
    equal(links.first().text(), 'cat');
    equal(links.last().text(), 'dog');
  });
});

test('viewing a model\'s records', function() {
  visit('/admin');

  andThen(function() {
    var links = find('a');
    click('#' + links.first().prop('id'));
  });

  andThen(function() {
    var rows = find('table tr');

    rowValuesEqual(rows.eq(0), 'id', 'name', 'age');
    rowValuesEqual(rows.eq(1), '1', 'Felix', '10');
    rowValuesEqual(rows.eq(2), '2', 'Nyan', '3');
  });
});

test('editing a record', function() {
  visit('/admin/cat');

  andThen(function() {
    var link = find('a:contains("Felix")');
    click(link);
  });

  andThen(function() {
    fillInByLabel('name', 'Hobbes');
    fillInByLabel('age', 29);
    offset = 1;
    click(find('button.save'));
  });

  andThen(function() {});

  andThen(function() {
    var rows = find('table tr');
    rowValuesEqual(rows.eq(1), '1', 'Hobbes', '29');
  });
});

test('creating a new record', function() {
  visit('/admin/cat');

  andThen(function() {
    var link = find('a:contains("Create")');
    click(link, "cannot find 'Create'");
  });

  andThen(function() {
    fillInByLabel('name', 'Lion-O');
    fillInByLabel('age', 30);
    offset = 2;
    click(find('button.save'));
  });

  andThen(function() {});

  andThen(function() {
    var rows = find('table tr');
    rowValuesEqual(rows.eq(3), '3', 'Lion-O', '30');
  });
});

test('deleting a record', function() {
  visit('/admin/cat/1/edit');

  andThen(function() {
    offset = 3;
    click(find('button.delete'));
  });

  andThen(function() {});

  andThen(function() {
    var rows = find('table tr');
    rowValuesEqual(rows.eq(1), '2', 'Nyan', '3');
  });
});
