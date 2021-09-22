<template>
	<div class="container mt-5 col-12 col-lg-6 col-xl-4 m-0 mx-auto">
		<div>
			<div class="row mb-4 text-center">
				<h1>
					Surprise Me Spotify!
				</h1>
			</div>
			<div class="col-lg-12">
				<div class="row mb-4">
					<div class="form-group">
						<form v-on:submit.prevent="getSearchResult">
							<div class="search-input">
								<input class="custom-input" type="search" placeholder="Enter artist name" v-model="searchStringArtist" @keyup="getSearchArtistResult" />
								<template v-if="searchStringArtist">
									<button type="button" @click="resetStringArtist" class="btn bg-transparent" style="margin-left: -40px; z-index: 100; padding: 0;">
										<img
											src="x-symbol.svg"
											alt="x symbol"
											height="10"
											width="10" />
									</button>
								</template>
							</div>
							<template v-if="!artistName">
								<input class="custom-badge mt-2" placeholder="Artist name" :value="artistName" disabled>
							</template>
							<template v-else>
								<button @click="deleteArtist" class="custom-badge delete mt-2" placeholder="Artist name">{{ artistName }}</button>
							</template>
						</form>
						<div v-if="artistSearchResult" class="col-lg-12 mt-4">
							<div v-if="artistSearchResult.artists.total == 0">
								<p><b>Sorry, we haven't found anything :(</b></p>
							</div>
							<ul class="button-list" v-for="result in artistSearchResult.artists.items" v-bind:key="result.id">
									<button class="custom-badge" @click="submitArtist(result.id, result.name)">{{ result.name }}</button>
							</ul>
						</div>
						
					</div>
				</div>
				<div class="row">
					<form v-on:submit.prevent="getSearchTrackResult">
						<div>
							<input class="custom-input" type="text" placeholder="Enter track title" v-model="searchStringTrack" @keyup="getSearchTrackResult" />
							<template v-if="searchStringTrack">
								<button type="button" @click="resetStringTrack" class="btn bg-transparent" style="margin-left: -40px; z-index: 100; padding: 0;">
									<img
										src="x-symbol.svg"
										alt="x symbol"
										height="10"
										width="10" />
								</button>
							</template>
						</div>
						<template v-if="!trackName">
								<input class="custom-badge mt-2" placeholder="Track name" :value="trackName" disabled>
							</template>
							<template v-else>
								<button @click="deleteTrack" class="custom-badge delete mt-2" placeholder="Track name">{{ trackName }}</button>
							</template>
					</form>
				</div>
				<div class="row mb-4">
					<div v-if="trackSearchResult" class="col-lg-12 mt-4">
						<div v-if="trackSearchResult.tracks.total == 0">
							<p><b>Sorry, we haven't found anything :(</b></p>
						</div>
						<ul class="button-list" v-for="result in trackSearchResult.tracks.items" v-bind:key="result.id">
							<button class="custom-badge"  @click="submitTrack(result.id, result.name)">{{ result.name }} | {{ result.artists[0].name }}</button>
						</ul>
					</div>
				</div>
				<div class="row mb-4">
					<v-select
						class="style-chooser"
						:options="genreSeeds.genres"
						@input="(genre) =>submitGenreSeed(genre)"
						placeholder="Genre"
					/>
				</div>
			</div>
			<div class="col-lg-12">
				<div class="row">
					<form v-on:submit.prevent class="d-flex flex-column justify-between">
						<input @focus="$event.target.select()" class="custom-badge mb-2" type="text" v-model="artist_id" placeholder="Artist ID">
						<input @focus="$event.target.select()" class="custom-badge mb-2" type="text" v-model="track_id" placeholder="Track ID">
						<input @focus="$event.target.select()" class="custom-badge" type="text" v-model="genre" placeholder="Genre">
					</form>
				</div>
				<div class="row mt-4 px-3">
					<button class="custom-badge" @click="handleOk">Recommend!</button>
				</div>
			</div>
				<div class="col-lg-12 mt-5">
					<vue-element-loading :active="loading" spinner="line-wave" 
					background-color="transparent"
					color="#1ed760"
					text="I'm searching..."
					duration="0.6"/>
					<div v-if="recommendations">
						<div v-for="rec in recommendations.tracks" v-bind:key="rec.id">
							<div class="text-center d-flex flex-column mb-2">
								<h3 class="primary-color">{{ rec.artists[0].name }} &dash; {{ rec.name }}</h3>
								<a class="custom-link" target="_blank" :href="rec.external_urls.spotify">Open in Spotify App!</a>
							</div>
							<div>
								<iframe :src="`https://open.spotify.com/embed/album/` + rec.album.id"   width="100%" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
							</div>
						</div>
					</div>
					<div v-if="recommendationError">
						<p class="text-danger"><b>{{ recommendationError }}</b></p>
					</div>
				</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios';
import querystring from 'querystring';
import _ from 'lodash';

export default {
	data () {
		return {
			artistName: '',
			trackName: '',
			artist: {},
			artist_id: '',
			track: {},
			track_id: '',
			album: {},
			albumId: '',
			genreSeeds: '',
			genre: '',
			recommendations: {},
			accessToken: '',
			searchStringArtist: '',
			artistSearchResult: null,
			searchStringTrack: '',
			trackSearchResult: null,
			recommendationError: '',

			loading: false,
			awaitingSearch: false,
		}	
	},
	mounted () {
		this.getAuth();
	},

	methods: {
		getAuth() {
			const headers = {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': 'Basic NWE0MTYxMjkxZTFiNDhhY2I4MzYzYzUwOWU5OWNiODg6OWNhMWIwYTEyZjU5NGZjMGIyMmUwYmNlOTFlOGExOTM=',
				}
			};
			const data = {
				grant_type: 'client_credentials'
			};
			axios.post('https://accounts.spotify.com/api/token', querystring.stringify(data), headers)
			.then((response) => {
				this.accessToken = response.data.access_token;
				this.getGenreSeeds();

			})
			.catch((error) => {
				console.log(error);
			})
		},
		getGenreSeeds () {
			axios.get('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this.accessToken
				}
			})
			.then((response) => {
				this.genreSeeds = response.data
			})
			
			.catch((error) => {
				console.log(error);
			})

		},
		submitArtist(id, name) {
			this.artist_id = id;
			this.artistName = name;
			this.artistSearchResult = null;
			this.searchStringArtist = '';

		},
		deleteArtist() {
			this.artist_id = '';
			this.artistName = '';
		},
		submitTrack(id, name) {
			this.track_id = id;
			this.trackName = name;
			this.trackSearchResult = null;
			this.searchStringTrack = '';
		},
		deleteTrack() {
			this.track_id = '';
			this.trackName = '';
		},
		submitGenreSeed(genre) {
			this.genre = genre;
		},
		resetStringArtist() {
			this.searchStringArtist = '';
			this.artistSearchResult = null;
		},
		resetStringTrack() {
			this.searchStringTrack = '';
			this.trackSearchResult = null;
		},
		handleOk(){
			this.loading = !this.loading;
			this.recommendations = {};
			this.getRecommendation();
			this.recommendationError = '';
		},
		getSearchArtistResult: _.debounce(function () {
			axios.get('https://api.spotify.com/v1/search', {
				params: {
					q: this.searchStringArtist,
					type: 'artist',
					limit: 5
				},
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this.accessToken
				}
			}).then((response) => {
				this.artistSearchResult = response.data;
			}).catch((error) => {
				console.log(error.response);
				this.artistSearchResult = null;
			})
		}, 500),
		getSearchTrackResult: _.debounce(function () {
			axios.get('https://api.spotify.com/v1/search', {
				params: {
					q: this.searchStringTrack,
					type: 'track',
					limit: 10
				},
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this.accessToken
				}
			}).then((response) => {
				this.trackSearchResult = response.data;
			}).catch((error) => {
				console.log(error);
				this.trackSearchResult = null;
			})
		}, 500),
		getRecommendation: _.debounce(function () {
			this.loading = !this.loading;
			axios.get('https://api.spotify.com/v1/recommendations', {
				params: {
					seed_artists: this.artist_id,
					seed_genres: this.genre,
					seed_tracks: this.track_id,
					min_energy: 0.4,
					min_popularity: 1,
					limit: 1
				},
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + this.accessToken
				}
			})
			.then((response) => {
				this.loading = false;
				this.recommendations = response.data
				this.recommendationError = '';
			})
			
			.catch((error) => {
				console.log(error);
				this.recommendationError = 'Something went wrong. Properly fill the data and try again.'
			})

		}, 500),
	},
}
</script>