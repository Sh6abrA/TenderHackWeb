import HTMLWebpackPlugin  from 'html-webpack-plugin'
import webpack, { DefinePlugin, HotModuleReplacementPlugin } from 'webpack'
import { BuildOptions } from '../build/types/config'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'


export function buildPlugins({paths, isDev}: BuildOptions): webpack.WebpackPluginInstance[] {
    const plugins = [
        new HTMLWebpackPlugin({
            template: paths.html,
        }),
        new webpack.ProgressPlugin(),
        new MiniCssExtractPlugin({filename: 'css/[name].[contenthash:8].css', chunkFilename: 'css/[name].[contenthash:8].css'}),
        new DefinePlugin({
            __IS_DEV__: JSON.stringify(isDev),
        }),
    ]
    if(isDev) {
        plugins.push(new HotModuleReplacementPlugin())
        plugins.push(new BundleAnalyzerPlugin({
            openAnalyzer: false
        }))
    }
    
    return plugins
}