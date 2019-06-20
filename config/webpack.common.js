const webpack = require('webpack');
const helpers = require('./helpers');

module.exports = {
	entry: {
		'scripts/popup': './app/scripts/popup.ts',
		'scripts/polyfills': './app/scripts/polyfills.ts',
		'scripts/vendor': './app/scripts/vendor.ts'
	},

	resolve: {
		extensions: ['.js', '.ts']
	},

	module: {
		rules: [
			{
				test: /\.ts$/,
				use: ['awesome-typescript-loader', 'angular2-template-loader']
			},
			{
				test: /\.html$/,
				use: ['html-loader']
			},
			{
				test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
				use: [{
					loader: 'file-loader',
					options: {'name': 'assets/[name].[hash].[ext]'}
				}]
			},
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			}
		]
	},

	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: ['scripts/popup', 'scripts/vendor', 'scripts/polyfills']
		}),
		new webpack.ContextReplacementPlugin(
			// The (\\|\/) piece accounts for path separators in *nix and Windows
			/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
			helpers.root('./src'), // location of your src
			{} // a map of your routes
		)
	]
};