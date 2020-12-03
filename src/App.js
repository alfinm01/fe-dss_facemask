import "./App.css"
import React from "react"
import axios from "axios"

// import * as tf from '@tensorflow/tfjs'
import * as tmImage from "@teachablemachine/image"

import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import List from "@material-ui/core/List"
import Table from "@material-ui/core/Table"
import Paper from "@material-ui/core/Paper"
import Button from "@material-ui/core/Button"
import ListItem from "@material-ui/core/ListItem"
import TableRow from "@material-ui/core/TableRow"
import Container from "@material-ui/core/Container"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableHead from "@material-ui/core/TableHead"
import Typography from "@material-ui/core/Typography"
import CardContent from "@material-ui/core/CardContent"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import TableContainer from "@material-ui/core/TableContainer"
import CardActionArea from "@material-ui/core/CardActionArea"
import CircularProgress from "@material-ui/core/CircularProgress"
import { makeStyles } from "@material-ui/core/styles"

import API from "./config"
import Logo from "./logo.png"

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  media: {
    height: 140,
  },
  table: {
    minWidth: 650,
  },
})

// TODO:
// setIsSafe
// Loader position
// Truncate detail pengunjung tidak bermasker

function App() {
  const classes = useStyles()

  const [loading, setLoading] = React.useState(true)
  const [mask, setMask] = React.useState(false)
  const [detecting, setDetecting] = React.useState(false)
  // eslint-disable-next-line no-unused-vars
  const [isSafe, setIsSafe] = React.useState(false)
  const [camera, setCamera] = React.useState(false)
  const [maskValue, setMaskValue] = React.useState("")
  const [noMaskValue, setNoMaskValue] = React.useState("")
  const [data, setData] = React.useState({
    total_pengunjung: 0,
    total_pelanggaran: 0,
    total_aman: 0,
    pelanggaran: [],
  })

  React.useEffect(() => {
    async function fetchData() {
      console.log("fetchData called")
      setLoading(true)
      await axios
        .get(`${API.backend}/api/dashboard/`)
        .then((response) => {
          if (response.data) {
            setLoading(false)
            setData(response.data)
          } else {
            console.log("no data")
            setLoading(false)
            alert("Gagal! Ada kesalahan internal")
          }
        })
        .catch((error) => {
          console.log("error catch")
          console.log(error.response)
          alert("Gagal! Ada error internal")
        })
    }

    async function sendData() {
      console.log("sendData called")
      setLoading(true)
      const payload = {
        pelanggaran: mask,
      }
      await axios
        .post(`${API.backend}/api/dashboard/`, payload)
        .then((response) => {
          console.log(response)
          if (response.data && response.data.message) {
            setLoading(false)
            console.log(response.data.message)
          } else {
            setLoading(false)
            console.log("error response")
            alert("Gagal! Ada error internal")
          }
        })
        .catch((error) => {
          console.log("error catch")
          console.log(error.response)
          alert("Gagal! Ada error internal")
        })
    }

    if (detecting) {
      sendData()
    }
    fetchData()
  }, [detecting])

  React.useEffect(() => {
    if (!loading) {
      console.log({ maskValue, noMaskValue })
      if (!detecting) {
        console.log("masuk 1")
        if (Math.round(parseFloat(maskValue) * 100) >= 90) {
          console.log("masuk 3")
          setMask(true)
          setDetecting(true)
        } else if (Math.round(parseFloat(noMaskValue) * 100) >= 90) {
          console.log("masuk 4")
          setMask(false)
          setDetecting(true)
        }
      } else {
        console.log("masuk 2")
        if (
          Math.round(parseFloat(maskValue) * 100) < 90 &&
          Math.round(parseFloat(noMaskValue) * 100) < 90
        ) {
          console.log("masuk 5")
          setDetecting(false)
        }
      }
    }

    // set isSafe
  }, [maskValue, noMaskValue])

  // More API functions here:
  // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

  // the link to your model provided by Teachable Machine export panel
  const URL = API.model

  let model
  let webcam
  let labelContainer
  let maxPredictions

  // Load the image model and setup the webcam
  const initWebcam = async () => {
    const modelURL = `${URL}model.json`
    const metadataURL = `${URL}metadata.json`

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL)
    maxPredictions = model.getTotalClasses()

    // Convenience function to setup a webcam
    const flip = true // whether to flip the webcam
    webcam = new tmImage.Webcam(550, 400, flip) // width, height, flip
    await webcam.setup() // request access to the webcam
    await webcam.play()
    window.requestAnimationFrame(loop)

    setCamera(true)

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas)
    labelContainer = document.getElementById("label-container")
    for (let i = 0; i < maxPredictions; i += 1) {
      // and class labels
      labelContainer.appendChild(document.createElement("div"))
    }
  }

  const loop = async () => {
    webcam.update() // update the webcam frame
    await predict()
    window.requestAnimationFrame(loop)
  }

  // run the webcam image through the image model
  const predict = async () => {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas)

    setMaskValue(prediction[0].probability.toFixed(2))
    setNoMaskValue(prediction[1].probability.toFixed(2))
  }

  return (
    <div className="App">
      <Container>
        <Grid container spacing={3} justify="center" my={10}>
          <Grid item xs={12} md={4}>
            <h1>Kamera 1 - Lokasi Cawang</h1>
          </Grid>
          <Grid item xs={12} md={8} style={{ textAlign: "right" }}>
            <h1>
              {new Date(Date.now()).toLocaleString("ar-EG" /* en-GB */, {
                timeZone: "Asia/Jakarta",
              })}
            </h1>
          </Grid>
        </Grid>
        {loading ? (
          <CircularProgress style={{ marginTop: 5, marginBottom: 5 }} />
        ) : (
          <span />
        )}
        <Grid container spacing={3} justify="center">
          <Grid item xs={12}>
            <Grid container spacing={3} justify="center" alignItems="center">
              <Grid container item justify="center" xs={12} md={4}>
                <Card className={classes.root} elevation={3}>
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h6">
                        Total Pengunjung
                      </Typography>
                      <Typography variant="h4" color="textSecondary">
                        {data.total_pengunjung}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid container item justify="center" xs={12} md={4}>
                <Card className={classes.root} elevation={3}>
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h6">
                        Pengunjung Bermasker
                      </Typography>
                      <Typography variant="h4" color="textSecondary">
                        {data.total_aman}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid container item justify="center" xs={12} md={4}>
                <Card className={classes.root} elevation={3}>
                  <CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h6">
                        Pengunjung Tidak Bermasker
                      </Typography>
                      <Typography variant="h4" color="textSecondary">
                        {data.total_pelanggaran}
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
            <h2>Pemantauan Real-Time</h2>
            <Typography
              variant="subtitle1"
              color="textSecondary"
              id="webcam-container"
            />
            {!camera ? (
              <Button
                color="inherit"
                variant="outlined"
                style={{ textTransform: "none" }}
                onClick={initWebcam}
              >
                Nyalakan Kamera
              </Button>
            ) : (
              <Typography
                variant="subtitle1"
                color="textSecondary"
                id="label-container"
              >
                Prediksi deteksi masker: {maskValue}
                <br />
                Prediksi deteksi non-masker: {noMaskValue}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid item xs={12}>
              <h2>Rekomendasi Langkah Terbaik</h2>
            </Grid>
            <Grid container spacing={3} item xs={12}>
              <List component="nav" aria-label="main mailbox folders">
                {isSafe ? (
                  <ListItem button>
                    <ListItemIcon>
                      <img src={Logo} alt="Logo" width="36" height="36" />
                    </ListItemIcon>
                    <ListItemText primary="Aman" />
                  </ListItem>
                ) : (
                  <>
                    <ListItem button>
                      <ListItemIcon>
                        <img src={Logo} alt="Logo" width="36" height="36" />
                      </ListItemIcon>
                      <ListItemText primary="Tidak Aman 1" />
                    </ListItem>
                    <ListItem button>
                      <ListItemIcon>
                        <img src={Logo} alt="Logo" width="36" height="36" />
                      </ListItemIcon>
                      <ListItemText primary="Tidak Aman 2" />
                    </ListItem>
                  </>
                )}
              </List>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={3} justify="center">
          <Grid item xs={12}>
            <h2>Detail Pengunjung Tidak Bermasker</h2>
          </Grid>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Kamera</TableCell>
                    <TableCell>Lokasi</TableCell>
                    <TableCell>Waktu</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.pelanggaran.length > 0 ? (
                    data.pelanggaran.map((row, i) => (
                      <TableRow key={row.waktu}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell component="th" scope="row">
                          {row.kamera}
                        </TableCell>
                        <TableCell>{row.lokasi}</TableCell>
                        <TableCell>{row.waktu}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow key="no data">
                      <TableCell component="th" scope="row">
                        Belum ada data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

export default App
