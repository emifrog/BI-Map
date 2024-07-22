
(this["webpackJsonpsptools-client"] = this["webpackJsonpsptools-client"] || []).push([
    [0], {
        186: function (e) {
            console.log("test");

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

getJSON('http://192.168.0.106:5500/json/hancy.json',
    function(err, data) {
      if (err !== null) {
        console.log('Something went wrong: ' + err);
      } else {
        console.log(data.HANCY);
        console.log('Your query count: ' + data.HANCY.length);
      }
    });
        },
        188: function (e, i, t) {
            e.exports = t(420)
        },
        193: function (e, i, t) {},
        194: function (e, i, t) {
            e.exports = t.p + "img/logo.svg"
        },
        195: function (e, i, t) {},
        407: function (e, i) {},
        409: function (e, i) {},
        420: function (e, i, t) {
            "use strict";
            t.r(i);
            var o = t(0),
                n = t.n(o),
                u = t(41),
                m = t.n(u),
                a = (t(193), t(194), t(195), t(113), t(14)),
                N = t(77),
                I = (t(167), t(397), t(72)),
                C = t(73),
                d = t(75),
                E = t(76),
                l = (o.Component, t(50)),
                D = t(183),
                p = t(25),
                L = t(186),
                A = t(187),
                s = t.n(A),
                c = t(82),
                S = (t(419), t(80)),
                Y = t(81),
                r = {
                    mapboxApiAccessToken: "pk.eyJ1IjoiY2l0eWFuYTJzIiwiYSI6ImNpeWhzbDJnMzAwM3cycXFtaXZtMm42d2MifQ.lm8tRvKVLyEGJOuTr7WJ3g"
                },
                P = {
                    width: "100%",
                    height: "100vh"
                },
                B = {
                    country: "fr",
                    bbox: [6.374816894531251, 43.51270490464819, 7.487182617187501, 44.11716972942086]
                },
                F = (s()([43.70385, 7.26858], 5, {
                    steps: 10,
                    units: "kilometers",
                    properties: {
                        foo: "bar"
                    }
                }), function (e) {
                    Object(E.a)(t, e);
                    var i = Object(d.a)(t);

                    function t() {
                        var e;
                        Object(I.a)(this, t);
                        for (var o = arguments.length, u = new Array(o), m = 0; m < o; m++) u[m] = arguments[m];
                        return (e = i.call.apply(i, [this].concat(u))).state = {
                            viewport: {
                                latitude: 43.70452,
                                longitude: 7.26839,
                                zoom: 17
                            },
                            caserne: {
                                latitude: 43.70452,
                                longitude: 7.26839,
                                zoom: 17
                            },
                            intervention: null,
                            id: 10,
                            selectedBI: null
                        }, e.onSelected = function (i, t) {
                            e.state.intervention = i, e.setState({
                                viewport: i
                            }), console.log("Selected: ", t)
                        }, e.goInter = function () {
                            e.state.intervention && e.setState({
                                viewport: e.state.intervention
                            })
                        }, e.goCaserne = function () {
                            e.setState({
                                viewport: e.state.caserne
                            })
                        }, e.redraw50 = function (i) {
                            var t = i.project;
                            if (e.state.intervention) {
                                var o = t([e.state.intervention.longitude, e.state.intervention.latitude]),
                                    u = Object(l.a)(o, 2),
                                    m = u[0],
                                    a = u[1];
                                return n.a.createElement("circle", {
                                    cx: m,
                                    cy: a,
                                    r: 50,
                                    fill: "rgba(255, 0, 0, .4)"
                                })
                            }
                            return null
                        }, e.redraw100 = function (i) {
                            var t = i.project;
                            if (e.state.intervention) {
                                var o = t([e.state.intervention.longitude, e.state.intervention.latitude]),
                                    u = Object(l.a)(o, 2),
                                    m = u[0],
                                    a = u[1];
                                return n.a.createElement("circle", {
                                    cx: m,
                                    cy: a,
                                    r: 100,
                                    fill: "rgba(0, 128, 0, .4)"
                                })
                            }
                            return null
                        }, e
                    }
                    return Object(C.a)(t, [{
                        key: "render",
                        value: function () {
                            var e = this,
                                i = this.state,
                                t = i.viewport,
                                o = i.caserne,
                                u = i.intervention,
                                m = {
                                    backgroundColor: "#FF0000",
                                    color: "#f8f9fa"
                                };
                            return n.a.createElement("div", null, n.a.createElement(p.d, Object.assign({}, r, t, P, {
                                mapStyle: "mapbox://styles/cityana2s/cjjqxrao50zxo2ro0lzwx03lw",
                                onViewportChange: function (i) {
                                    return e.setState({
                                        viewport: i
                                    })
                                }
                            }), n.a.createElement(p.c, {
                                redraw: this.redraw50
                            }), n.a.createElement(p.c, {
                                redraw: this.redraw100
                            }), n.a.createElement(D.a, Object.assign({}, r, {
                                onSelected: this.onSelected,
                                viewport: t,
                                hideOnSelect: !0,
                                queryParams: B
                            })), n.a.createElement(p.a, {
                                key: this.state.id,
                                latitude: o.latitude,
                                longitude: o.longitude
                            }, n.a.createElement("button", {
                                className: "marker-btn"
                            }, n.a.createElement("img", {
                                src: "img/caserne2.png",
                                alt: ""
                            }))), this.state.intervention ? n.a.createElement(p.a, {
                                key: this.state.id,
                                latitude: u.latitude,
                                longitude: u.longitude
                            }, n.a.createElement("button", {
                                className: "marker-btn"
                            }, n.a.createElement("div", {
                                class: "pin"
                            }), n.a.createElement("div", {
                                class: "pulse"
                            }))) : null, L.a.map((function (i) {
                                return n.a.createElement(p.a, {
                                    key: i.Num,
                                    latitude: parseFloat(i.Latitude),
                                    longitude: parseFloat(i.Longitude)
                                }, n.a.createElement("button", {
                                    className: "marker-btn",
                                    "data-idbi": i.Num,
                                    "data-latbi": i.Latitude,
                                    "data-longbi": i.Longitude,
                                    onClick: function (i) {
                                        i.preventDefault(), console.log(i.currentTarget), e.setState({
                                            selectedBI: {
                                                id: i.currentTarget.attributes.getNamedItem("data-idbi").value,
                                                latitude: i.currentTarget.attributes.getNamedItem("data-latbi").value,
                                                longitude: i.currentTarget.attributes.getNamedItem("data-longbi").value
                                            }
                                        })
                                    }
                                }, n.a.createElement("img", {
                                    src: "img/bi_30.png",
                                    alt: "bi"
                                })))
                            })), this.state.selectedBI ? n.a.createElement(p.b, {
                                latitude: parseFloat(this.state.selectedBI.latitude),
                                longitude: parseFloat(this.state.selectedBI.longitude),
                                onClose: function () {
                                    e.setState({
                                        selectedBI: null
                                    })
                                }
                            }, n.a.createElement("div", null, n.a.createElement("h2", null, "BI :  ", this.state.selectedBI.id))) : null), n.a.createElement(c.b, {
                                icon: n.a.createElement(S.a, {
                                    icon: Y.b
                                }),
                                mainButtonStyles: {
                                    backgroundColor: "#FF0000"
                                }
                            }, n.a.createElement(c.a, {
                                text: "Retour Intervention",
                                onClick: this.goInter,
                                style: m
                            }, n.a.createElement(S.a, {
                                icon: Y.a
                            })), n.a.createElement(c.a, {
                                text: "Retour Caserne",
                                onClick: this.goCaserne,
                                style: m
                            }, n.a.createElement(S.a, {
                                icon: Y.c
                            })), n.a.createElement(c.a, {
                                text: "F.I.R.E",
                                onClick: this.goCaserne,
                                style: m
                            }, n.a.createElement(S.a, {
                                icon: Y.d
                            }))))
                        }
                    }]), t
                }(o.Component));
            Object(N.withScriptjs)(Object(N.withGoogleMap)((function () {
                return n.a.createElement(N.GoogleMap, {
                    defaultZoom: 10,
                    defaultCenter: {
                        lat: 45.421532,
                        lng: -75.697189
                    }
                })
            })));
            var H = function () {
                return n.a.createElement(F, null)
            };
            Boolean("localhost" === window.location.hostname || "[::1]" === window.location.hostname || window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));
            m.a.render(n.a.createElement(n.a.StrictMode, null, n.a.createElement(H, null)), document.getElementById("root")), "serviceWorker" in navigator && navigator.serviceWorker.ready.then((function (e) {
                e.unregister()
            })).catch((function (e) {
                console.error(e.message)
            }))
        }
    },
    [
        [188, 1, 2]
    ]
]);
