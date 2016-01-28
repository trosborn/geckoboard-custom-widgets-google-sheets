function main() {
  var data = getRows();
  pusher(data.key, data.widgets);
}

function pusher(key, widgets) {
  widgets.forEach(function(widget) {
    var widgetURL = "https://push.geckoboard.com/v1/send/" + widget.key;
    var payload = {
      "api_key": key,
      "data": widget.data
    }
    var options = {
      "method" : "post",
      "contentType": "application/json",
      "payload" : payload
    };
    options.payload = JSON.stringify(options.payload);
    Logger.log(options);
    UrlFetchApp.fetch(widgetURL, options);
  });
}

function getRows() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var key = rows[0][1];
  var data = rows.slice(1);
  var widgetRows = findWidgets(data);
  var widgets = splitWidgetData(data, widgetRows);
  var payloads = makePayloads(widgets);
  return {
    key: key,
    widgets: payloads
  }
}

function makePayloads(widgets) {
  return widgets.map(function(widget) {
    var key = widget[0][1];
    var type = widget[1][1];
    var data = widgetType(type, widget.slice(2));
    return {
      key: key,
      data: data
    }
  });
}

function splitWidgetData(data, widgetRows) {
  var widgets = [];
  for (var i = 0; i < widgetRows.length; i++) {
    var widget;
    if (widgetRows[i + 1] === undefined) {
      widget = data.slice(widgetRows[i]);
    } else {
      var widget = data.slice(widgetRows[i], widgetRows[i + 1]);
    }
    widgets = widgets.concat([widget]);
  }
  return widgets;
}
               
function findWidgets(rows) {
  var widgetIndexii = [];
  var column = rows.map(function(row) {
    return row[0];
  });
  for (var i = 0; i < column.length; i++) {
    if (column[i] === 'Widget') {
      widgetIndexii = widgetIndexii.concat(i);
    }
  }
  return widgetIndexii;
}

function widgetType(type, data) {
  var types = {
    RAG: function(items) {
      return { 
        item: items.map(function(item) {
          return { 
            value: item[0],
            text: item[1]
          }
        })
      }
    }
  }
  return types[type](data);
}