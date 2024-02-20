<script>
	import { onMount } from "svelte";
	import jsPDF from "jspdf/dist/jspdf.umd.js";
	import mapboxgl from "mapbox-gl";
	import * as turf from "@turf/turf";
	import Icon from "@iconify/svelte";
	import "../routes/styles.css";

	import streets from "../routes/assets/mainstreets-southern-ontario.geo.json";
	import logo from "../routes/assets/logo.png";

	import Metric from "../lib/ui/Metric.svelte";
	import Accordion from "../lib/ui/Accordion.svelte";
	import LegendItem from "../lib/ui/legends/LegendItem.svelte";

	mapboxgl.accessToken =
		"pk.eyJ1IjoiY2FuYWRpYW51cmJhbmluc3RpdHV0ZSIsImEiOiJjbG95bzJiMG4wNW5mMmlzMjkxOW5lM241In0.o8ZurilZ00tGHXFV-gLSag";

	export let map;

	let distance = "0";
	let eligibility = "";
	let eligibilitycolor = "";
	let message = "";

	// info
	let streetname = "Southern Ontario";
	let place = "5,299 Main Streets";

	// basic

	let population = "29,482,761";
	let employees = "1,692,453";

	// business
	let business = "397,476";
	let business_retail = "185,241";
	let business_services = "143,274";
	let business_food_drink = "68,960";

	let independent_business = 0.52; //BII_avg

	// civic

	let civic = "197,035";
	let civic_govt_community = "59,272";
	let civic_healthcare = "80,252";
	let civic_education = "34,858";
	let civic_arts_culture = "8,551";
	let civic_recreation = "14,101";

	// demographic

	// income + education

	let income = 76427;
	let education = 28;

	// age

	let average_age = 41;
	let age_0_19 = 20;
	let age_20_64 = 61;
	let age_over_65 = 19;

	// equity

	let immigrants = 28.4;
	let visibleminority = 29.4;
	let indigenous = 3.9;

	// commute

	let car = 76;
	let public_transit = 15;
	let active_transit = 8;

	// housing

	let dwellings = "11,936,445";
	let singledetached = 49;
	let semidetached = 5;
	let duplex = 6;
	let apartments_more_than_5 = 11;
	let apartments_less_than_5 = 19;

	// language

	// let french = 18;
	// let english = 62;

	let geocoder;

	const bounds = [
		[-83.14951046, 41.67694922],
		[-74.32038089, 46.2933883],
	];

	function generatePDF() {
		const doc = new jsPDF({
			unit: "pt",
		}); // create jsPDF object
		const pdfElement = document.getElementById("sidebar"); // HTML element to be converted to PDF

		doc.html(pdfElement, {
			callback: (pdf) => {
				pdf.save(`${streetname} Data (My Main Street).pdf`);
			},
			margin: 12, // optional: page margin
			// optional: other HTMLOptions
		});
	}

	function handleMapClick(e) {
		document.getElementById("streetCatchmentLegend").style.display =
			"block";

		document.getElementById("downloadButton").style.display = "flex";

		// map zooming

		const endpoints = e.features[0].geometry.coordinates;
		const midpoint = turf.midpoint(endpoints[0], endpoints[1]);

		map.flyTo({
			center: midpoint.geometry.coordinates,
			zoom: 14,
		});

		const id = e.features[0].properties.ROADSEGID;

		// general

		streetname = e.features[0].properties.R_STNAM;
		place = e.features[0].properties.R_PLACE;

		population = e.features[0].properties.Pop;
		employees = e.features[0].properties.total_emp.toFixed(0);

		// business

		business =
			e.features[0].properties.FdandDr +
			e.features[0].properties.Retail +
			e.features[0].properties.SrvcsaO;
		business_food_drink = e.features[0].properties.FdandDr;
		business_retail = e.features[0].properties.Retail;
		business_services = e.features[0].properties.SrvcsaO;
		independent_business = e.features[0].properties.BII_avg.toFixed(2);

		// civic

		civic =
			e.features[0].properties.ArtsanC +
			e.features[0].properties.Educatn +
			e.features[0].properties.GvrnaCS +
			e.features[0].properties.HlthaCF +
			e.features[0].properties.RcrtnFc;
		civic_arts_culture = e.features[0].properties.ArtsanC;
		civic_education = e.features[0].properties.Educatn;
		civic_govt_community = e.features[0].properties.GvrnaCS;
		civic_healthcare = e.features[0].properties.HlthaCF;
		civic_recreation = e.features[0].properties.RcrtnFc;

		// demographic

		// income + education

		income = parseFloat(
			e.features[0].properties.AvgEmpInc.toFixed(0),
		).toLocaleString();
		education = e.features[0].properties.UniDeg.toFixed(0);

		// age

		average_age = e.features[0].properties.AvgAge.toFixed(0);
		age_0_19 = e.features[0].properties.Age0_19.toFixed(0);
		age_20_64 = e.features[0].properties.Age20_64.toFixed(0);
		age_over_65 = e.features[0].properties.Age65_Over.toFixed(0);

		// equity

		immigrants = e.features[0].properties.ImmNPR.toFixed(0);
		visibleminority = e.features[0].properties.VM.toFixed(0);
		indigenous = e.features[0].properties.Indig.toFixed(0);

		// commute

		car = e.features[0].properties.MobCar.toFixed(0);
		public_transit = e.features[0].properties.MobPT.toFixed(0);
		active_transit = e.features[0].properties.MobAct.toFixed(0);

		// housing

		dwellings = e.features[0].properties.TotalDwellings.toFixed(0);
		singledetached = e.features[0].properties.SinDetach.toFixed(0);
		semidetached = e.features[0].properties.SemiDetach.toFixed(0);
		duplex = e.features[0].properties.Duplex.toFixed(0);
		apartments_more_than_5 = e.features[0].properties.AptMore5.toFixed(0);
		apartments_less_than_5 = e.features[0].properties.AptLess5.toFixed(0);

		// language

		// english = e.features[0].properties.LanEng.toFixed(0);
		// french = e.features[0].properties.LanFr.toFixed(0);

		// highlighting road

		let feature;

		streets.features.forEach((e) => {
			if (e.properties.ROADSEGID === id) {
				feature = e;
			}
		});

		if (typeof map.getLayer("selectedRoad") !== "undefined") {
			map.removeLayer("selectedRoad");
			map.removeSource("selectedRoad");
			// map.removeLayer("selectedRoadBuffer");
			// map.removeSource("selectedRoadBuffer");
		}

		let buffered = turf.buffer(feature, 1);

		map.addSource("selectedRoad", {
			type: "geojson",
			data: feature,
		});

		const geobbox = turf.bbox(buffered);
		const bboxpoint1 = map.project([geobbox[0], geobbox[1]]);
		const bboxpoint2 = map.project([geobbox[2], geobbox[3]]);

		// const bboxpolygon = turf.bboxPolygon(geobbox);

		const bbox = [bboxpoint1, bboxpoint2];

		// Find features intersecting the bounding box.
		const selectedFeatures = map.queryRenderedFeatures(bbox, {
			layers: ["canada-DAs"],
		});

		const dauid = selectedFeatures.map(
			(feature) => feature.properties.DAUID,
		);
		// Set a filter matching selected features by FIPS codes
		// to activate the 'counties-highlighted' layer.
		map.setFilter("canada-DAs-highlighted", ["in", "DAUID", ...dauid]);

		// map.addSource('selectedRoadBuffer', {
		// 	type: 'geojson',
		// 	data: bboxpolygon
		// });

		// map.addLayer({
		// 	id: 'selectedRoadBuffer',
		// 	type: 'fill',
		// 	source: 'selectedRoadBuffer',
		// 	paint: {
		// 		'fill-color': '#ffb8b8',
		// 		'fill-opacity': 0.4
		// 	}
		// }, 'mainstreets-southern-ontario');

		map.addLayer({
			id: "selectedRoad",
			type: "line",
			source: "selectedRoad",
			layout: {
				"line-join": "round",
				"line-cap": "round",
			},
			paint: {
				"line-color": "#cb1515",
				"line-width": 5,
			},
		});
	}

	onMount(() => {
		map = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/canadianurbaninstitute/clruxylvp00xl01qqhyy4661x?fresh=true",
			center: [-79.1, 44.07],
			zoom: 6.3,
			minZoom: 2,
			maxBounds: bounds,
			scrollZoom: true,
			attributionControl: false,
		});

		geocoder = new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			countries: "ca",
			proximity: "ip",
			types: "address", // region, country, postcode, district, place, locality, neighborhood
			language: "en, fr",
			bbox: [-83.14951046, 41.67694922, -74.32038089, 46.2933883], // filters to southern ottawa bbox
			marker: true,
			marker: {
				color: "#006501",
			},
			placeholder: "Enter your address",
			flyTo: {
				padding: 15, // If you want some minimum space around your result
				zoom: 14, // If you want your result not to go further than a specific zoom
			},
			mapboxgl: mapboxgl,
		});

		map.addControl(new mapboxgl.NavigationControl(), "top-right");

		map.addControl(
			new mapboxgl.AttributionControl({
				customAttribution:
					"Canadian Urban Institute, Data Sources: Environics Analytics, Statistics Canada",
			}),
		);

		map.scrollZoom.disable();

		// Geocoder Search

		map.on("load", () => {
			map.addControl(geocoder, "top-left");

			geocoder.on("result", function (e) {
				map.once("moveend", function () {
					const coordinate = [e.result.center[0], e.result.center[1]];
					const point = turf.point(coordinate);

					// Variable to hold the nearest line feature and its distance
					let nearestLine;
					let nearestDistance = Infinity;

					// Iterate through each line feature
					streets.features.forEach((feature) => {
						// Convert the line coordinates to a Turf.js lineString
						const line = turf.lineString(
							feature.geometry.coordinates,
						);

						// Calculate the distance from the point to the line
						const distance = turf.pointToLineDistance(point, line, {
							units: "kilometers",
						});

						// Check if this line is the nearest so far
						if (distance < nearestDistance) {
							nearestDistance = distance;
							nearestLine = feature;
						}
					});

					const geojson = {
						type: "FeatureCollection",
						features: [nearestLine],
					};

					document.getElementById(
						"nearestStreetLabel",
					).style.display = "block";

					distance = (nearestDistance * 1000).toFixed(0);

					if (nearestDistance < 0.1) {
						handleMapClick(geojson);
						eligibility = "eligible";
						eligibilitycolor = "#006501";
						message =
							"Please enter this information directly into your Expression of Interest application. You can use the download button to download a copy the data associated with the main street.";
					} else {
						console.log("not eligible");
						eligibility = "ineligible";
						eligibilitycolor = "#cb1515";
						message = "";
						removeFilters();
					}
				});
			});

			map.addSource("canada-DAs", {
				type: "vector",
				url: "mapbox://canadianurbaninstitute.dayeanmd",
			});

			map.addLayer(
				{
					id: "canada-DAs",
					type: "fill",
					source: "canada-DAs",
					"source-layer": "canadaDAs",
					paint: {
						"fill-outline-color": "rgba(200,200,200,0.1)",
						"fill-color": "rgba(0,0,0,0)",
					},
				},
				// Place polygons under labels, roads and buildings.
				"mainstreets-southern-ontario",
			);

			map.addLayer(
				{
					id: "canada-DAs-highlighted",
					type: "fill",
					source: "canada-DAs",
					"source-layer": "canadaDAs",
					paint: {
						"fill-outline-color": "#cb1515",
						"fill-color": "#ffb8b8",
						"fill-opacity": 0.4,
					},
					filter: ["in", "DAUID", ""],
				},
				// Place polygons under labels, roads and buildings.
				"mainstreets-southern-ontario",
			);
		});

		map.on(
			"click",
			[
				"mainstreets-southern-ontario",
				"mainstreets-southern-ontario-invisible",
			],
			handleMapClick,
		);

		// Change the cursor to a pointer when
		// the mouse is over the states layer. yea
		map.on(
			"mouseenter",
			[
				"mainstreets-southern-ontario",
				"mainstreets-southern-ontario-invisible",
			],
			() => {
				map.getCanvas().style.cursor = "pointer";
			},
		);

		// Change the cursor back to a pointer
		// when it leaves the states layer.
		map.on(
			"mouseleave",
			[
				"mainstreets-southern-ontario",
				"mainstreets-southern-ontario-invisible",
			],
			() => {
				map.getCanvas().style.cursor = "";
			},
		);
	});

	// Reset Map

	function resetMap() {
		map.flyTo({
			center: [-79.1, 44.07],
			zoom: 6.3,
		});

		geocoder.clear();

		distance = "0";
		document.getElementById("nearestStreetLabel").style.display = "none";
		document.getElementById("streetCatchmentLegend").style.display = "none";

		// info
		streetname = "Southern Ontario";
		place = "5,299 Main Streets";

		// basic

		population = "29,482,761";
		employees = "1,692,453";

		// business
		business = "397,476";
		business_retail = "185,241";
		business_services = "143,274";
		business_food_drink = "68,960";

		independent_business = 0.52; //BII_avg

		// civic

		civic = "197,035";
		civic_govt_community = "59,272";
		civic_healthcare = "80,252";
		civic_education = "34,858";
		civic_arts_culture = "8,551";
		civic_recreation = "14,101";

		// demographic

		// income + education

		income = 76427;
		education = 28;

		// age

		average_age = 41;
		age_0_19 = 20;
		age_20_64 = 61;
		age_over_65 = 19;

		// equity

		immigrants = 28.4;
		visibleminority = 29.4;
		indigenous = 3.9;

		// commute

		car = 76;
		public_transit = 15;
		active_transit = 8;

		// housing

		dwellings = "11,936,445";
		singledetached = 49;
		semidetached = 5;
		duplex = 6;
		apartments_more_than_5 = 11;
		apartments_less_than_5 = 19;

		// language

		// french = 18;
		// english = 62;

		map.removeLayer("selectedRoad");
		map.removeSource("selectedRoad");
		map.setFilter("canada-DAs-highlighted", ["in", "DAUID", ""]);
	}

	function removeFilters() {
		document.getElementById("streetCatchmentLegend").style.display = "none";
		document.getElementById("downloadButton").style.display = "none";


		// info
		streetname = "Southern Ontario";
		place = "5,299 Main Streets";

		// basic

		population = "29,482,761";
		employees = "1,692,453";

		// business
		business = "397,476";
		business_retail = "185,241";
		business_services = "143,274";
		business_food_drink = "68,960";

		independent_business = 0.52; //BII_avg

		// civic

		civic = "197,035";
		civic_govt_community = "59,272";
		civic_healthcare = "80,252";
		civic_education = "34,858";
		civic_arts_culture = "8,551";
		civic_recreation = "14,101";

		// demographic

		// income + education

		income = 76427;
		education = 28;

		// age

		average_age = 41;
		age_0_19 = 20;
		age_20_64 = 61;
		age_over_65 = 19;

		// equity

		immigrants = 28.4;
		visibleminority = 29.4;
		indigenous = 3.9;

		// commute

		car = 76;
		public_transit = 15;
		active_transit = 8;

		// housing

		dwellings = "11,936,445";
		singledetached = 49;
		semidetached = 5;
		duplex = 6;
		apartments_more_than_5 = 11;
		apartments_less_than_5 = 19;

		// language

		// french = 18;
		// english = 62;

		map.removeLayer("selectedRoad");
		map.removeSource("selectedRoad");
		map.setFilter("canada-DAs-highlighted", ["in", "DAUID", ""]);
	}
</script>

<svelte:head>
	<link
		href="https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css"
		rel="stylesheet"
	/>
	<script
		src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js"
	></script>
	<link
		rel="stylesheet"
		href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css"
		type="text/css"
	/>
</svelte:head>

<div id="content-container">
	<div id="sidebar">
		<div id="nearestStreetLabel">
			<h5>
				The nearest Main Street is {distance} metres away. This address is
				<span style="color: {eligibilitycolor};">{eligibility}</span>
				for the My Main Street Program. {message} For any questions, please
				<a href="https://mymainstreet.ca/contact-us">contact us</a>.
			</h5>
			<hr />
		</div>
		<div>
			<h2>{streetname}</h2>
		</div>
		<h5>{place}</h5>
		<hr />
		<div class="legend">
			<LegendItem
				variant={"polygon"}
				label={"Main Streets"}
				bgcolor={"#5E32BD"}
				bordercolor={"#5E32BD"}
			/>
			<div id="streetCatchmentLegend">
				<LegendItem
					variant={"polygon"}
					label={"Main Street Catchment Area (1km)"}
					bgcolor={"#ffb8b8"}
					bordercolor={"#cb1515"}
				/>
			</div>
		</div>
		<button id="downloadButton" on:click={generatePDF}>
			Download Data
		</button>
		<hr />
		<div id='metric-download'>
		<div class="metric-container">
			<Metric
				label={"Population"}
				value={population}
				icon={"fluent:people-20-filled"}
			/>
			<Metric
				label={"Employees"}
				value={employees}
				icon={"mdi:briefcase"}
			/>
		</div>
		<Accordion>
			<Metric
				accordion
				slot="header"
				label={"Civic Infrastructure (On Street)"}
				value={civic}
				icon={"heroicons:building-library-20-solid"}
			/>
			<div slot="body">
				<div class="metric-container">
					<Metric
						label={"Education"}
						value={civic_education}
						icon={"mdi:school"}
					/>
					<Metric
						label={"Arts & Culture"}
						value={civic_arts_culture}
						icon={"fa6-solid:masks-theater"}
					/>
					<Metric
						label={"Recreation"}
						value={civic_recreation}
						icon={"material-symbols:park-rounded"}
					/>
				</div>
				<div class="metric-container">
					<Metric
						label={"Government & Community Services"}
						value={civic_govt_community}
						icon={"mingcute:government-fill"}
					/>
					<Metric
						label={"Health & Care Facilities"}
						value={civic_healthcare}
						icon={"mdi:hospital-box"}
					/>
				</div>
			</div>
		</Accordion>
		<Accordion>
			<Metric
				accordion
				slot="header"
				label={"Businesses (On Street)"}
				value={business}
				icon={"mdi:building"}
			/>
			<div slot="body" class="metric-container">
				<Metric
					label={"Retail"}
					value={business_retail}
					icon={"mdi:shopping"}
				/>
				<Metric
					label={"Food & Drink"}
					value={business_food_drink}
					icon={"dashicons:food"}
				/>
				<Metric
					label={"Services"}
					value={business_services}
					icon={"mdi:ticket"}
				/>
			</div>
		</Accordion>
		<Metric
			label={"Independent Business Index"}
			value={independent_business}
			icon={"mdi:shop"}
		/>
		<h6>Demographic</h6>
		<div class="metric-container">
			<Metric
				label={"Average Income"}
				prefix={"$"}
				value={income.toLocaleString()}
				icon={"mdi:wallet"}
			/>
			<Metric
				label={"Bachelor's Degree"}
				value={education}
				suffix={"%"}
				icon={"mdi:school"}
			/>
		</div>
		<Accordion>
			<Metric
				accordion
				slot="header"
				label={"Average Age"}
				value={average_age}
				icon={"mingcute:birthday-2-fill"}
			/>
			<div slot="body" class="metric-container">
				<Metric label={"0 to 19"} value={age_0_19} suffix={"%"} />
				<Metric label={"20 to 64"} value={age_20_64} suffix={"%"} />
				<Metric
					label={"65 and over"}
					value={age_over_65}
					suffix={"%"}
				/>
			</div>
		</Accordion>
		<div class="metric-container">
			<Metric
				label={"Recent Immigrants"}
				value={immigrants}
				suffix={"%"}
				icon={"mdi:globe"}
			/>
			<Metric
				label={"Visible Minorities"}
				value={visibleminority}
				suffix={"%"}
				icon={"material-symbols:handshake"}
			/>
			<Metric
				label={"Indigenous Population"}
				value={indigenous}
				suffix={"%"}
				icon={"mdi:person"}
			/>
		</div>
		<h6>Commuting</h6>
		<div class="metric-container">
			<Metric label={"Car"} value={car} suffix={"%"} icon={"mdi:car"} />
			<Metric
				label={"Public Transit"}
				value={public_transit}
				suffix={"%"}
				icon={"mdi:bus"}
			/>
			<Metric
				label={"Active Transit"}
				value={active_transit}
				suffix={"%"}
				icon={"mdi:bike"}
			/>
		</div>
		<h6>Housing</h6>
		<Accordion>
			<Metric
				accordion
				slot="header"
				label={"Dwellings"}
				value={dwellings}
				icon={"material-symbols:apartment"}
			/>
			<div slot="body">
				<div class="metric-container">
					<Metric
						label={"Single Detached"}
						value={singledetached}
						suffix={"%"}
					/>
					<Metric
						label={"Semi-Detached"}
						value={semidetached}
						suffix={"%"}
					/>
					<Metric label={"Duplex"} value={duplex} suffix={"%"} />
				</div>
				<div class="metric-container">
					<Metric
						label={"Apartment (>5 stories)"}
						value={apartments_more_than_5}
						suffix={"%"}
					/>
					<Metric
						label={"Apartment (<5 stories)"}
						value={apartments_less_than_5}
						suffix={"%"}
					/>
				</div>
			</div>
		</Accordion>
		</div>
		<hr />
		<button id="resetButton" on:click={resetMap}> Reset Map </button>
	</div>
	<div id="map" />
</div>

<style>
	:global(body) {
		padding: 0px;
		margin: 0px;
		background-color: white;
		height: 100%;
	}

	#map {
		height: 100vh;
		width: 100%;
		position: relative;
	}

	@media only screen and (min-width: 768px) {
		#content-container {
			display: flex;
			flex-direction: row;
			overflow: hidden;
		}

		#sidebar {
			width: 35vw;
			display: flex;
			flex-direction: column;
			padding: 0.5em 1em 0.5em 1em;
			border: 1px solid #eee;
			overflow-y: scroll;
			overflow-x: hidden;
			height: 100vh;
		}
	}

	@media only screen and (max-width: 768px) {
		#content-container {
			flex-direction: column;
		}

		#sidebar {
			width: 100%;
			padding: 1em;
		}
	}

	#resetButton {
		background-color: var(--brandGreen);
		opacity: 1;
		width: 100%;
		display: flex;
		padding: 0.3em;
		align-items: center;
		justify-content: center;
		color: #fff;
		text-decoration: none;
		font-size: 0.8em;
		border: none;
		font-family: "Roboto", sans-serif;
		font-weight: 400;
	}

	#resetButton:hover {
		cursor: pointer;
		background-color: #297424;
		transition: 0.5s;
	}

	#downloadButton {
		background-color: var(--brandGreen);
		opacity: 1;
		width: 100%;
		display: none;
		padding: 0.3em;
		align-items: center;
		justify-content: center;
		color: #fff;
		text-decoration: none;
		font-size: 0.8em;
		border: none;
		font-family: "Roboto", sans-serif;
		font-weight: 400;
		margin: 0.5em 0 0.5em 0;
	}

	#downloadButton:hover {
		cursor: pointer;
		background-color: #297424;
		transition: 0.5s;
	}

	.metric-container {
		display: flex;
		flex-direction: row;
		gap: 0.5em;
		/*width: 20vw;*/
	}

	h6 {
		margin: 0.5em 0 0.5em 0;
	}

	hr {
		border: 0.5px solid #eee;
		width: 100%;
	}

	.legend {
		background-color: #fff;
		padding: 0.2em;
		border: 1px solid #eee;
		margin: 0.5em 0 0.5em 0;
	}

	#nearestStreetLabel {
		display: none;
		text-align: center;
	}

	#streetCatchmentLegend {
		display: none;
	}
</style>
