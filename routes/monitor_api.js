var express = require('express');
var router = express.Router();
var db = require('../database');

router.get('/:guardian_id', function(req, res) {
  db.query('SELECT * FROM guardians WHERE name = ?', req.params.guardian_id)
      .then(id => {
        var data = {};
        data['alias'] = id[0].alias;
        data['alarms'] = JSON.parse(id[0].alarms_active);

        var auraPromise = db.query(
            'SELECT * FROM aura_data WHERE guardian = ? ORDER BY time DESC LIMIT 1',
            req.params.guardian_id);
        auraPromise
            .then(rows => {
              if (rows.length > 0) {
                data['aura'] = JSON.parse(rows[0].data);
              }
            })
            .catch(err => {
              console.log('error: ' + err);
            });

        var camsPromise = db.query(
            'SELECT * FROM cams_data WHERE guardian = ? ORDER BY time DESC LIMIT 1',
            req.params.guardian_id);
        camsPromise
            .then(rows => {
              if (rows.length > 0) {
                data['cams'] = JSON.parse(rows[0].data);
              }
            })
            .catch(err => {
              console.log('error: ' + err);
            });

        var dataPromise;
        switch (id[0].type) {
          case 0:  // ELV
            dataPromise = db.query(
                'SELECT * FROM elv_data WHERE guardian = ? ORDER BY time DESC LIMIT 1',
                req.params.guardian_id);
            dataPromise
                .then(rows => {
                  data['elv'] = JSON.parse(rows[0].data);
                })
                .catch(err => {
                  console.log('error: ' + err);
                });
            break;
          case 1:  // ELVP
            dataPromise = db.query(
                'SELECT * FROM elvp_data WHERE guardian = ? ORDER BY time DESC LIMIT 1',
                req.params.guardian_id);
            dataPromise
                .then(rows => {
                  data['elvp'] = JSON.parse(rows[0].data);
                })
                .catch(err => {
                  console.log('error: ' + err);
                });
            break;
          case 2:  // Series 3
            dataPromise = db.query(
                'SELECT * FROM s3_data WHERE guardian = ? ORDER BY time DESC LIMIT 1',
                req.params.guardian_id);
            dataPromise
                .then(rows => {
                  data['series3'] = JSON.parse(rows[0].data);
                })
                .catch(err => {
                  console.log('error: ' + err);
                });
            break;
          case 3:  // Series 4
            dataPromise = db.query(
                'SELECT * FROM s4_data WHERE guardian = ? ORDER BY time DESC LIMIT 1',
                req.params.guardian_id);
            dataPromise
                .then(rows => {
                  data['series4'] = JSON.parse(rows[0].data);
                })
                .catch(err => {
                  console.log('error: ' + err);
                });
            break;
          case 4:  // Battery Monitor
            dataPromise = db.query(
                'SELECT * FROM battmon_data WHERE guardian = ? ORDER BY time DESC LIMIT 1',
                req.params.guardian_id);
            dataPromise
                .then(rows => {
                  data['battmon'] = JSON.parse(rows[0].data);
                })
                .catch(err => {
                  console.log('error: ' + err);
                });
            break;
        }
        Promise.all([auraPromise, camsPromise, dataPromise]).then(values => {
          res.json(data);
        });
      })
      .catch(err => {
        console.log('error: ' + err);
      });
});

router.get('/history/:guardian_id', function(req, res) {
  db.query('SELECT * FROM guardians WHERE name = ?', req.params.guardian_id)
      .then(id => {
        var history = {};

        var auraPromise = db.query(
            'SELECT * FROM aura_data WHERE guardian = ? AND time > NOW() - INTERVAL 1 DAY ORDER BY time DESC',
            req.params.guardian_id);
        auraPromise
            .then(rows => {
              if (rows.length > 0) {
                history['aura'] = [];
                for (var index = 0; index < rows.length; index++) {
                  var row = JSON.parse(rows[index].data)
                  history['aura'][index] = {};
                  history['aura'][index].Time =
                      Date.parse(rows[index].time) / 1000;
                  history['aura'][index].Temp = row.Temp.value
                  history['aura'][index].Temp_F = row.Temp_F.value
                  history['aura'][index].Humid = row.Humid.value
                  history['aura'][index].Press = row.Press.value
                  history['aura'][index].O2 = row.O2.value
                  history['aura'][index].CO2 = row.CO2.value
                  history['aura'][index].CO = row.CO.value
                  history['aura'][index].H2S = row.H2S.value
                }
              }
            })
            .catch(err => {
              console.log('error: ' + err);
            });

        // var camsPromise = db.query(
        //     "SELECT * FROM cams_data WHERE guardian = ? AND time > NOW() -
        //     INTERVAL 1 DAY ORDER BY time DESC", req.params.guardian_id);
        // camsPromise
        //     .then(rows => {
        //       if (rows.length > 0) {
        //         history['cams'] = JSON.parse(rows[0].data);
        //       }
        //     })
        //     .catch(err => {
        //       console.log('error: ' + err);
        //     });

        var dataPromise;
        switch (id[0].type) {
          case 0:  // ELV
            dataPromise = db.query(
                'SELECT * FROM elv_data WHERE guardian = ? AND time > NOW() - INTERVAL 1 DAY ORDER BY time DESC',
                req.params.guardian_id);
            dataPromise
                .then(rows => {
                  if (rows.length > 0) {
                    history['elv'] = [];
                    for (var index = 0; index < rows.length; index++) {
                      var row = JSON.parse(rows[index].data)
                      history['elv'][index] = {};
                      history['elv'][index].Time =
                          Date.parse(rows[index].time) / 1000;
                      history['elv'][index].voltage_battery =
                          +((row.serial.V / 1000).toFixed(2))
                      history['elv'][index].current_battery =
                          +((row.serial.I / 1000).toFixed(2))
                      history['elv'][index].voltage_mains = row.mains
                      history['elv'][index].voltage_inverter = row.inverter
                    }
                  }
                })
                .catch(err => {
                  console.log('error: ' + err);
                });
            break;
          case 1:  // ELVP
            dataPromise = db.query(
                'SELECT * FROM elvp_data WHERE guardian = ? AND time > NOW() - INTERVAL 1 DAY ORDER BY time DESC',
                req.params.guardian_id);
            dataPromise
                .then(rows => {
                  if (rows.length > 0) {
                    history['elvp'] = [];
                    for (var index = 0; index < rows.length; index++) {
                      var row = JSON.parse(rows[index].data)
                      history['elvp'][index] = {};
                      history['elvp'][index].Time =
                          Date.parse(rows[index].time) / 1000;
                      history['elvp'][index].voltage_emergency =
                          +((row.serial.V / 1000).toFixed(2))
                      history['elvp'][index].voltage_standby =
                          +((row.serial.VS / 1000).toFixed(2))
                      history['elvp'][index].current_battery =
                          +((row.serial.I / 1000).toFixed(2))
                      history['elvp'][index].voltage_mains = row.mains
                      history['elvp'][index].voltage_inverter = row.inverter
                    }
                  }
                })
                .catch(err => {
                  console.log('error: ' + err);
                });
            break;
          case 2:  // Series 3
            dataPromise = db.query(
                'SELECT * FROM s3_data WHERE guardian = ? AND time > NOW() - INTERVAL 1 DAY ORDER BY time DESC',
                req.params.guardian_id);
            dataPromise
                .then(rows => {
                  if (rows.length > 0) {
                    history['series3'] = [];
                    for (var index = 0; index < rows.length; index++) {
                      var row = JSON.parse(rows[index].data)
                      history['series3'][index] = {};
                      history['series3'][index].Time =
                          Date.parse(rows[index].time) / 1000;
                      history['series3'][index].voltage_inverter =
                          parseFloat(row.raw[6].row_info)
                      history['series3'][index].voltage_battery =
                          parseFloat(row.raw[10].row_info)
                      history['series3'][index].voltage_bridge =
                          parseFloat(row.raw[12].row_info)
                      history['series3'][index].temp_internal =
                          parseFloat(row.raw[0].row_info)
                      history['series3'][index].temp_external =
                          parseFloat(row.raw[2].row_info)
                      history['series3'][index].temp_battery =
                          parseFloat(row.raw[4].row_info)
                      history['series3'][index].current_battery =
                          parseFloat(row.raw[8].row_info)
                    }
                  }
                })
                .catch(err => {
                  console.log('error: ' + err);
                });
            break;
          case 3:  // Series 4
            dataPromise = db.query(
                'SELECT * FROM s4_data WHERE guardian = ? AND time > NOW() - INTERVAL 1 DAY ORDER BY time DESC',
                req.params.guardian_id);
            dataPromise
                .then(rows => {
                  if (rows.length > 0) {
                    history['series4'] = [];
                    for (var index = 0; index < rows.length; index++) {
                      var row = JSON.parse(rows[index].data)
                      history['series4'][index] = {};
                      history['series4'][index].Time =
                          Date.parse(rows[index].time) / 1000;
                      history['series4'][index].voltage_mains =
                          parseFloat(row.system_information[0].row_info)
                      history['series4'][index].voltage_battery =
                          parseFloat(row.system_information[1].row_info)
                      history['series4'][index].voltage_inverter =
                          parseFloat(row.system_information[2].row_info)
                      history['series4'][index].temp_internal =
                          parseFloat(row.system_information[5].row_info)
                      history['series4'][index].temp_external =
                          parseFloat(row.system_information[6].row_info)
                      history['series4'][index].temp_battery =
                          parseFloat(row.system_information[4].row_info)
                      history['series4'][index].current_battery =
                          parseFloat(row.system_information[3].row_info)
                    }
                  }
                })
                .catch(err => {
                  console.log('error: ' + err);
                });
            break;
          case 4:  // Battery Monitor
            dataPromise = db.query(
                'SELECT * FROM battmon_data WHERE guardian = ? AND time > NOW() - INTERVAL 1 DAY ORDER BY time DESC',
                req.params.guardian_id);
            dataPromise
                .then(rows => {
                  history['battmon'] = JSON.parse(rows[0].data);
                })
                .catch(err => {
                  console.log('error: ' + err);
                });
            break;
        }
        Promise.all([auraPromise, dataPromise]).then(values => {
          res.json(history);
        });
      })
      .catch(err => {
        console.log('error: ' + err);
      });
});

module.exports = router;