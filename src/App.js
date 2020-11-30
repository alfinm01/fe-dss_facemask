import React from "react"
import './App.css'
// import * as tf from '@tensorflow/tfjs'
import * as tmImage from '@teachablemachine/image'
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import Button from "@material-ui/core/Button"
import Typography from "@material-ui/core/Typography"
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardContent from "@material-ui/core/CardContent"
import CardMedia from "@material-ui/core/CardMedia"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import axios from "axios"
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import API from "./config"
import Logo from "./logo.png"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles({
  root: {
    minWidth: 275
  },
  media: {
    height: 140
  },
  table: {
    minWidth: 650,
  },
})

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9),
];

function App() {
  const classes = useStyles()

  const [state, setState] = React.useState({
    detecting: false,
    loading: false
  })
  const [data, setData] = React.useState(['Rekomendasi 1', 'Rekomendasi 2'])
  const [lands, setLands] = React.useState([])
  const [loadingData, setLoadingData] = React.useState(true)
  const columns = [
    { title: "ID Lahan", field: "id" },
    { title: "Nama", field: "nama" },
    { title: "Deskripsi", field: "deskripsi" },
    { title: "Tanaman", field: "tanaman" },
    { title: "Dibuat pada", field: "created_at" }
  ]

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
    webcam = new tmImage.Webcam(600, 400, flip); // width, height, flip
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
      <Container>
        <Grid container spacing={3} justify="center">
          <Grid item xs={12} md={4}>
            <h1>Kamera A - Lokasi X</h1>
          </Grid>
          <Grid item xs={12} md={8} style={{textAlign: 'right'}}>
            <h1>{new Date(Date.now()).toLocaleString("en-US", {timeZone: "Asia/Jakarta"})}</h1>
          </Grid>
        </Grid>
        <Grid container spacing={3} justify="center">
          <Grid item xs={12}>
            <Grid container spacing={3} justify="center" alignItems="center">
              <Grid container item justify="center" xs={12} md={4}>
                <Card className={classes.root} elevation={3}>
                  <CardActionArea>
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                      >
                        Total Pengunjung
                      </Typography>
                      <Typography
                        variant="h4"
                        color="textSecondary"
                        fullWidth
                      >
                        520
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid container item justify="center" xs={12} md={4}>
                <Card className={classes.root} elevation={3}>
                  <CardActionArea>
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                      >
                        Pengunjung Bermasker
                      </Typography>
                      <Typography
                        variant="h4"
                        color="textSecondary"
                      >
                        420
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid container item justify="center" xs={12} md={4}>
                <Card className={classes.root} elevation={3}>
                  <CardActionArea>
                    <CardContent>
                      <Typography
                        gutterBottom
                        variant="h6"
                      >
                        Pengunjung Tidak Bermasker
                      </Typography>
                      <Typography
                        variant="h4"
                        color="textSecondary"
                      >
                        100
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={3} justify="center">
          <Grid item xs={12} md={6}>
            <h2>Asumsi selalu ada orang hehe</h2>
            <div id="webcam-container"></div>
            <div id="label-container"></div>
            <Button
              color="inherit"
              variant="outlined"
              fullWidth
              style={{ textTransform: "none" }}
              onClick={initWebcam}
            >
              Nyalakan Kamera
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid item xs={12}>
              <h2>Rekomendasi Langkah Terbaik</h2>
            </Grid>
            <Grid container spacing={3} item xs={12}>
              <List component="nav" aria-label="main mailbox folders">
                {data.map(item => (
                  <ListItem button>
                    <ListItemIcon>
                      <img src={Logo} alt="Logo" width="36" height="36" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.replace(".", ",")}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={3} justify="center">
          <Grid item xs={12}>
            <h2>Detail Pengunjung Tidak Bermasker</h2>
          </Grid>
          <Grid container item spacing={3} xs={12}>
            <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Dessert (100g serving)</TableCell>
                      <TableCell align="right">Calories</TableCell>
                      <TableCell align="right">Fat&nbsp;(g)</TableCell>
                      <TableCell align="right">Carbs&nbsp;(g)</TableCell>
                      <TableCell align="right">Protein&nbsp;(g)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.calories}</TableCell>
                        <TableCell align="right">{row.fat}</TableCell>
                        <TableCell align="right">{row.carbs}</TableCell>
                        <TableCell align="right">{row.protein}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
