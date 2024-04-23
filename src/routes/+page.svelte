<script>
	import { onMount } from "svelte";
	import mapboxgl from "mapbox-gl";
	import "../routes/styles.css";

	import LegendItem from "../lib/ui/legends/LegendItem.svelte";

	mapboxgl.accessToken =
		"pk.eyJ1IjoiY2FuYWRpYW51cmJhbmluc3RpdHV0ZSIsImEiOiJjbG95bzJiMG4wNW5mMmlzMjkxOW5lM241In0.o8ZurilZ00tGHXFV-gLSag";

	export let map;

	let geocoder;

	onMount(() => {
		map = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/canadianurbaninstitute/clvcg885801b301pe9bwhh3x2?fresh=true",
			center: [-89, 58],
			zoom: 3.3,
			maxZoom: 18,
			minZoom: 2,
			scrollZoom: true,
			attributionControl: false,
		});

		geocoder = new MapboxGeocoder({
			accessToken: mapboxgl.accessToken,
			countries: "ca",
			proximity: "ip",
			language: "en, fr",
			marker: true,
			marker: {
				color: "#ffd200",
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
		// Geocoder Search

		map.on("load", () => {
			map.addControl(geocoder, "top-left");
		});
		
	});

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

	<div id="map" />
	<div class="legend">
		<LegendItem variant={'line'} label={'High Density Main Streets'} bordercolor={'#002940'} />
		<LegendItem variant={'line'} label={'Low Density Main Street'} bordercolor={'#00adf2'} />
		<LegendItem variant={'line'} label={'Arterial Streets'} bordercolor={'#eee'} />
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

	.legend {
			position: absolute;
			bottom: 1em;
			right: 1em;
			background-color: #fff;
			padding: 1em;
			border-radius: 0.6em;
			border: 1px solid #eee;
			margin: 0 0 0.5em 0;
		}
</style>
