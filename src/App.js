import React from "react"
import './App.css'
// import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image'
// import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardContent from "@material-ui/core/CardContent"
import CardMedia from "@material-ui/core/CardMedia"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles({
  root: {
    maxWidth: 345
  },
  media: {
    height: 140
  }
})

function App() {
  const classes = useStyles()

  const [state, setState] = React.useState({
    detecting: false,
    loading: false
  })

  // More API functions here:
  // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

  // the link to your model provided by Teachable Machine export panel
  const URL = "https://teachablemachine.withgoogle.com/models/yjkTEIhZk/";

  let model, webcam, labelContainer, maxPredictions;

  // Load the image model and setup the webcam
  const initWebcam = async () => {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      // load the model and metadata
      // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
      // or files from your local hard drive
      // Note: the pose library adds "tmImage" object to your window (window.tmImage)
      model = await tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();

      // Convenience function to setup a webcam
      const flip = true; // whether to flip the webcam
      webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
      await webcam.setup(); // request access to the webcam
      await webcam.play();
      window.requestAnimationFrame(loop);

      // append elements to the DOM
      document.getElementById("webcam-container").appendChild(webcam.canvas);
      labelContainer = document.getElementById("label-container");
      for (let i = 0; i < maxPredictions; i++) { // and class labels
          labelContainer.appendChild(document.createElement("div"));
      }
  }

  async function loop() {
      webcam.update(); // update the webcam frame
      await predict();
      window.requestAnimationFrame(loop);
  }

  // run the webcam image through the image model
  async function predict() {
      // predict can take in an image, video or canvas html element
      const prediction = await model.predict(webcam.canvas);
      for (let i = 0; i < maxPredictions; i++) {
          const classPrediction =
              prediction[i].className + ": " + prediction[i].probability.toFixed(2);
          labelContainer.childNodes[i].innerHTML = classPrediction;
      }
  }
  
  return (
    <div className="App">
      <Grid container>
        <div>Teachable Machine Image Model</div>
        <Grid container spacing={3} justify="center">
          <Grid item xs={12}>
            <Grid container spacing={3} justify="center" alignItems="center">
              <Grid container item justify="center" xs={12} md={4}>
                <Card className={classes.root} elevation={3}>
                  <CardActionArea>
                    {/* <CardMedia
                      className={classes.media}
                      image={Dashboard}
                      title="Feature 1"
                    /> */}
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h2"
                        style={{ color: "green" }}
                      >
                        Real-time Monitoring
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                      >
                        Tanam menawarkan layanan dashboard untuk memantau lahan dan
                        tanaman secara real-time dengan memanfaatkan sensor IoT
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid container item justify="center" xs={12} md={4}>
                <Card className={classes.root} elevation={3}>
                  <CardActionArea>
                    {/* <CardMedia
                      className={classes.media}
                      image={Prediction}
                      title="Feature 2"
                    /> */}
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h2"
                        style={{ color: "green" }}
                      >
                        Prediction
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                      >
                        Tanam menawarkan layanan laporan prediksi keadaan lahan ke
                        depan dengan memanfaatkan Machine Learning
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid container item justify="center" xs={12} md={4}>
                <Card className={classes.root} elevation={3}>
                  <CardActionArea>
                    {/* <CardMedia
                      className={classes.media}
                      image={Like}
                      title="Feature 3"
                    /> */}
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h2"
                        style={{ color: "green" }}
                      >
                        Recommendation
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                      >
                        Tanam menawarkan layanan rekomendasi langkah terbaik dalam
                        bercocok tanam dengan memanfaatkan Machine Learning
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <button type="button" onClick={initWebcam}>Start</button>
        <div id="webcam-container"></div>
        <div id="label-container"></div>
      </Grid>
    </div>
  );
}

export default App;
