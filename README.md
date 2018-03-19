Static web page that demonstrates how multiple live HLS streams coming from from Eyevinn Channel Engine can be presented in a mosaic view.

## Deploying the web page
The content of the 'app' directory can be copied to a web server.
Alternatively, you can run it locally with the following commands:
```
npm install  
npm start  
```  
Then open the following url in your browser: http://localhost:8200

## HLS stream source
By default, the streams m3u8 files are retrieved from https://ott-channel-engine.herokuapp.com/eventstream.
In order to use a local Channel Engine instead, use url http://localhost:8200/#?dev. The page will use url http://localhost:8000/live/master.m3u8 to reach the Channel Engine.
