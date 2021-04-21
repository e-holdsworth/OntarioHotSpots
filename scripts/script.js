/*
    Project: COVID-19 Hot-Spot FSAs, Ontario
	Title: script.js
    Purpose: JS for Ontario HotSpots & Risk Factors
    Author: Emily Holdsworth
    Date: April 2021
 */

'use strict';

function init() {
    require(["esri/config",
            "esri/Map",
            "esri/views/MapView",

            "esri/widgets/BasemapToggle",
            "esri/widgets/Home",
            "esri/widgets/Legend",

            "esri/renderers/ClassBreaksRenderer",

            "esri/layers/FeatureLayer"
        ],
        function (esriConfig,
                  Map,
                  MapView,
                  BasemapToggle,
                  Home,
                  Legend,
                  ClassBreaksRenderer,
                  FeatureLayer
        ) {

            //configure using apikey from esri dev page "Demo Key"
            esriConfig.apiKey = "AAPKcf7cb91d41a744d1be85ec395a7db0e2XLmsWRRNUXTHjN647odbEY6PodqPkqLyXJMp-8qguVYZ8K8F-qudNCgKkD7nizeu";


            //////////////////////////////////////////////////////////
                             ///// MAP ELEMENTS /////
            //////////////////////////////////////////////////////////
            //create new map feature
            const map = new Map({
                basemap: "arcgis-light-gray" // Basemap layer service
            });

            //create new view feature
            const view = new MapView({
                map: map,
                center: [-78.742930,44.103000], // Longitude, latitude
                zoom: 6, // Zoom level
                container: "mapid" // Div element
            });


            //////////////////////////////////////////////////////////
                            ///// RENDERERS /////
            //////////////////////////////////////////////////////////

            //create simple fill styles function
            function createFillSymbol (color) {
                return {
                    type: "simple-fill",
                    color: color,
                    style: "solid",
                    outline: {
                        width: 0.2,
                        color: "#666666",
                        style: "solid"
                    }
                };
            }

            function createClassBreakSymbol(min,max,color,label) {
                return {
                    minValue: min,
                    maxValue: max,
                    symbol: createFillSymbol(color),
                    label: label
                }
            }

            function createDefaultSymbol() {
                return {
                    type: "simple-fill",
                    color: "black",
                    style: "backward-diagonal",
                    outline: {
                        width: 0.5,
                        color: [50,50,50,0.6]
                    }
                }
            }

            //renderer for hotspot map
            const HotSpotRenderer = {
                type: "unique-value",
                field: "HotSpot",
                uniqueValueInfos: [{
                    value: "Y",
                    symbol: createFillSymbol("#FCAF17")
                }, {
                    value: "N",
                    symbol: createFillSymbol("#858585")
                }]
            };

            //renderer for Cases map
            const CasesRenderer = {
                type: "class-breaks",
                field: "cases_num",
                defaultSymbol: createDefaultSymbol(),
                defaultLabel: "No Data",
                classBreakInfos: [
                    createClassBreakSymbol(0,1.25,"#FFEDA0","< 1.25 cases/100 people"),
                    createClassBreakSymbol(1.26, 2.50,"#E5BD87","1.25 - 2.50 cases/100 people"),
                    createClassBreakSymbol(2.51,3.75,"#CC8E6F","2.50 - 3.75 cases/100 people"),
                    createClassBreakSymbol(3.76,5.00,"#B25E56","3.75 - 5.00 cases/100 people"),
                    createClassBreakSymbol(5.01,6.25,"#992F3E","5.00 - 6.25 cases/100 people"),
                    createClassBreakSymbol(6.26,10,"#800026","> 6.25 cases/100 people")
                ],
                opacity: 0.9
            };

            //renderer for hospitalizations and deaths map
            const HospDeathsRend = {
                type: "class-breaks",
                field: "HospDeaths",
                defaultSymbol: createDefaultSymbol(),
                defaultLabel: "No Data",
                classBreakInfos: [
                    createClassBreakSymbol(0,0.92,"#FFEDA0","< 0.92 cases/100 people"),
                    createClassBreakSymbol(0.93, 1.84,"#E5BD87","0.92 - 1.84 Hospitalizations&Deaths /1000 people"),
                    createClassBreakSymbol(1.85,2.77,"#CC8E6F","1.84 - 2.77 Hospitalizations&Deaths /1000 people"),
                    createClassBreakSymbol(2.75,3.69,"#B25E56","2.77 - 3.69 Hospitalizations&Deaths /1000 people"),
                    createClassBreakSymbol(3.70,4.61,"#992F3E","3.69 - 4.61 Hospitalizations&Deaths /1000 people"),
                    createClassBreakSymbol(4.62,6,"#800026","> 4.61 Hospitalizations&Deaths /1000 people")
                ],
                opacity: 0.9
            };

            //renderer for Index map
            const IndRenderer = {
                //Index_Val
                type: "class-breaks",
                field: "Index_Val",
                defaultSymbol: createDefaultSymbol(),
                defaultLabel: "No Data",
                classBreakInfos: [
                    createClassBreakSymbol(0,0.65,"#FFEDA0","< 0.65"),
                    createClassBreakSymbol(0.66, 1.25,"#E5BD87","0.65 - 1.25"),
                    createClassBreakSymbol(1.26,1.88,"#CC8E6F","1.25 - 1.88"),
                    createClassBreakSymbol(1.89,2.50,"#B25E56","1.88 - 2.50"),
                    createClassBreakSymbol(2.51,3.10,"#992F3E","2.50 - 3.10"),
                    createClassBreakSymbol(3.11,4,"#800026","> 3.10")
                ],
                opacity: 0.9
            };

            //renderer for % Vaccinated, all ages map
            const VaccAllRenderer = {
                type: "class-breaks",
                field: "VaccAll",
                defaultSymbol: createDefaultSymbol(),
                defaultLabel: "No Data",
                classBreakInfos: [
                    createClassBreakSymbol(0,0.112,"#B8F2FF","< 11.2%"),
                    createClassBreakSymbol(0.113, 0.163,"#82E9FF","11.3 - 16.3 %"),
                    createClassBreakSymbol(0.164,0.215,"#47C9FF","16.3 - 21.5 %"),
                    createClassBreakSymbol(0.216,0.267,"#266EF6","21.5 - 26.7 %"),
                    createClassBreakSymbol(0.268,0.318,"#0643A5","26.7 - 31.8 %"),
                    createClassBreakSymbol(0.319,0.5,"#00308F","> 31.8 %")
                ],
                opacity: 0.9
            };

            //renderer for % Vaccinated, 80+ map
            const Vacc80Renderer = {
                type: "class-breaks",
                field: "Vacc80",
                defaultSymbol: createDefaultSymbol(),
                defaultLabel: "No Data",
                classBreakInfos: [
                    createClassBreakSymbol(0,0.46,"#B8F2FF","< 46%"),
                    createClassBreakSymbol(0.47, 0.55,"#82E9FF","46 - 55 %"),
                    createClassBreakSymbol(0.56,0.64,"#47C9FF","55 - 64 %"),
                    createClassBreakSymbol(0.65,0.73,"#266EF6","64 - 73 %"),
                    createClassBreakSymbol(0.74,0.82,"#0643A5","73 - 82 %"),
                    createClassBreakSymbol(0.83,0.95,"#00308F","> 82 %")
                ],
                opacity: 0.9
            };

            //renderer for Population map
            const PopulationRenderer = {
                type: "class-breaks",
                field: "Population",
                defaultSymbol: createDefaultSymbol(),
                defaultLabel: "No Data",
                classBreakInfos: [
                    createClassBreakSymbol(0,18800,"#d5efcf","< 18,800 people"),
                    createClassBreakSymbol(18801, 37300,"#b2e0ab","18,800 - 37,300 people"),
                    createClassBreakSymbol(37301,55800,"#7bc87c","37,300 - 55,800 people"),
                    createClassBreakSymbol(55801,74300,"#3da75a","55,800 - 74,300 people"),
                    createClassBreakSymbol(74301,92900,"#137e3a","74,300 - 92,900 people"),
                    createClassBreakSymbol(92901,111500,"#00441b","> 92,900 people")
                ],
                opacity: 0.9
            };

            //renderer for Average Income map
            const IncomeRenderer = {
                type: "class-breaks",
                field: "Income",
                defaultSymbol: createDefaultSymbol(),
                defaultLabel: "No Data",
                classBreakInfos: [
                    createClassBreakSymbol(0,53800,"#d5efcf","< $53,800 /year"),
                    createClassBreakSymbol(53801, 83600,"#b2e0ab","$53,800 - $83,600 /year"),
                    createClassBreakSymbol(83601,113300,"#7bc87c","$83,600 - $113,300 /year"),
                    createClassBreakSymbol(113301,143100,"#3da75a","$113,300 - $143,100 /year"),
                    createClassBreakSymbol(143101,172900,"#137e3a","$143,100 - $172,900 /year"),
                    createClassBreakSymbol(172901,203000,"#00441b","> $172,900 /year")
                ],
                opacity: 0.9
            };

            //renderer for 2018 election map
            const ElectionRenderer = {
                type: "unique-value",
                field: "Statistical_PartyResult",
                title: "2018 Election Results",
                uniqueValueInfos: [{
                    value: "PC",
                    symbol: createFillSymbol("blue")
                },{
                    value: "NDP",
                    symbol: createFillSymbol("orange"),

                },{
                    value: "LIB",
                    symbol: createFillSymbol("red"),
                },{
                    value: "GRE",
                    symbol: createFillSymbol("green")
                }]
            };


            //////////////////////////////////////////////////////////
                            /////FEATURE LAYERS/////
            //////////////////////////////////////////////////////////
            //create feature layer for FSA Information
            const OntarioFSAs = new FeatureLayer ({
                url: "https://services7.arcgis.com/mHbwJDn8p4Rz7gMw/arcgis/rest/services/ontario_fsas_numerical_data/FeatureServer/0",
                renderer: HotSpotRenderer,
                title: "Hot Spot FSA",
                opacity:0.8,
                outline: {
                    style: "solid",
                    color: "#ffffff"
                }
            });
            map.add(OntarioFSAs);

            //create feature layer for Election Riding
            const electionResults = new FeatureLayer ({
                url: "https://services7.arcgis.com/mHbwJDn8p4Rz7gMw/arcgis/rest/services/ontario_2018_election_results/FeatureServer/0",
                renderer: ElectionRenderer,
                opacity: 0.4
            });


            //////////////////////////////////////////////////////////
                    ///// BUTTON VARIABLE ASSIGNMENT /////
            //////////////////////////////////////////////////////////
            const HotSpotsBtn1 = document.querySelector('#btnradio1');
            const CasesBtn2 = document.querySelector('#btnradio2');
            const HospDeathsBtn3 = document.querySelector('#btnradio3');
            const IndexBtn4 = document.querySelector('#btnradio4');
            const VaccAllBtn5 = document.querySelector('#btnradio5');
            const Vacc80Btn6 = document.querySelector('#btnradio6');
            const PopulationBtn7 = document.querySelector('#btnradio7');
            const IncomeBtn8 = document.querySelector('#btnradio8');
            const electionBtn9 = document.querySelector('#btnradio9');

            //////////////////////////////////////////////////////////
                        ///// BUTTON LISTENERS /////
            //////////////////////////////////////////////////////////
            HotSpotsBtn1.addEventListener("click", function(){
                map.removeAll();
                OntarioFSAs.title = "Hot Spot FSAs";
                OntarioFSAs.renderer = HotSpotRenderer;
                map.add(OntarioFSAs);
            });

            CasesBtn2.addEventListener("click",function(){
                map.removeAll();
                OntarioFSAs.title = "COVID-19 Cases/100 People";
                OntarioFSAs.renderer = CasesRenderer;
                map.add(OntarioFSAs);
            });

            HospDeathsBtn3.addEventListener("click",function(){
                map.removeAll();
                OntarioFSAs.title = "Hospitalization/Deaths /1000 People";
                OntarioFSAs.renderer = HospDeathsRend;
                map.add(OntarioFSAs);
            });

            IndexBtn4.addEventListener("click",function(){
                map.removeAll();
                OntarioFSAs.title = "Cases/Hospitalizations, Equal Index";
                OntarioFSAs.renderer = IndRenderer;
                map.add(OntarioFSAs);
            });

            VaccAllBtn5.addEventListener("click", function(){
                map.removeAll();
                OntarioFSAs.title = "Vaccinations, at least 1 dose, All Ages";
                OntarioFSAs.renderer = VaccAllRenderer;
                map.add(OntarioFSAs);
            });

            Vacc80Btn6.addEventListener("click", function(){
                map.removeAll();
                OntarioFSAs.title = "Vaccinations, at least 1 dose, 80+";
                OntarioFSAs.renderer = Vacc80Renderer;
                map.add(OntarioFSAs);
            });

            PopulationBtn7.addEventListener("click",function(){
                map.removeAll();
                OntarioFSAs.title = "Population of FSA";
                OntarioFSAs.renderer = PopulationRenderer;
                map.add(OntarioFSAs);
            });

            IncomeBtn8.addEventListener("click",function(){
                map.removeAll();
                OntarioFSAs.title = "Average Income per Filer";
                OntarioFSAs.renderer = IncomeRenderer;
                map.add(OntarioFSAs);
            });

            electionBtn9.addEventListener("click",function(){
                map.removeAll();
                map.add(electionResults);
            });


            //////////////////////////////////////////////////////////
                                ///// WIDGETS /////
            //////////////////////////////////////////////////////////

            //create basemap toggle widget - to toggle between the initial basemap (OSM) and second (charted territory)
            const basemapToggle = new BasemapToggle({
                view: view,
                nextBasemap: "arcgis-streets"
            });
            //add the basemap toggle widget to the map in the bottom-right of the map view
            view.ui.add(basemapToggle,"bottom-right");

            //create home button widget
            const homeWidget = new Home({
                view: view
            });
            //add home button widget to the map
            view.ui.add(homeWidget, "top-left");

            //add legend to map
            var legend = new Legend({
                view: view,
                type: "classic",
                layerInfos: [{
                    layer: OntarioFSAs,
                    title: "Hot Spot FSAs"
                },{
                    layer: electionResults,
                    title: "2018 Provincial Election Results"
                }]
            });
            view.ui.add(legend,"bottom-left");

        });

}
