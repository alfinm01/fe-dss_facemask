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
import Backdrop from "@material-ui/core/Backdrop"
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

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  media: {
    height: 140,
  },
  table: {
    minWidth: 650,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}))

// TODO:
// BIG NOTE
// Mask value (true/false) apparently appears to be opposite, need to fix this next
// Hotfix: Reversed the value

function App() {
  const classes = useStyles()

  const [loading, setLoading] = React.useState(true)
  const [mask, setMask] = React.useState(false)
  const [detecting, setDetecting] = React.useState(false)
  const [condition, setCondition] = React.useState("safe")
  const [camera, setCamera] = React.useState(false)
  const [seeDetails, setSeeDetails] = React.useState(false)
  const [maskValue, setMaskValue] = React.useState("")
  const [noMaskValue, setNoMaskValue] = React.useState("")
  const [data, setData] = React.useState({
    total_pengunjung: 0,
    total_pelanggaran: 0,
    total_aman: 0,
    pelanggaran: [],
  })

  React.useEffect(() => {
    async function calculateCondition() {
      if (data.total_aman >= Math.round(data.total_pengunjung * 0.8)) {
        setCondition("safe")
      } else if (data.total_aman < Math.round(data.total_pengunjung / 2)) {
        setCondition("unsafe")
      } else {
        setCondition("neutral")
      }
    }

    calculateCondition()
  }, [data])

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

    fetchData()
  }, [detecting])

  React.useEffect(() => {
    async function sendData() {
      console.log("sendData called")
      setLoading(true)
      const payload = {
        pelanggaran: !mask, // THIS
      }
      await axios
        .post(`${API.backend}/api/dashboard/`, payload)
        .then((response) => {
          console.log(response)
          if (response.data && response.data.message) {
            setLoading(false)
            setDetecting(true)
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

    sendData()
  }, [mask])

  React.useEffect(() => {
    async function detectMask() {
      if (!loading) {
        console.log({ maskValue, noMaskValue })
        if (!detecting) {
          if (Math.round(parseFloat(maskValue) * 100) >= 90) {
            console.log("mask detected")
            setMask(true)
          } else if (Math.round(parseFloat(noMaskValue) * 100) >= 90) {
            console.log("no mask detected")
            setMask(false)
          }
        } else if (
          (mask && Math.round(parseFloat(maskValue) * 100) < 90) ||
          (!mask && Math.round(parseFloat(noMaskValue) * 100) < 90)
        ) {
          console.log("reset detection")
          setDetecting(false)
        }
      }
    }

    detectMask()
  }, [mask, maskValue, noMaskValue, detecting, loading])

  const showDetails = () => {
    const component = []

    if (data.pelanggaran.length > 0) {
      if (seeDetails) {
        data.pelanggaran.map((row, i) => {
          const parsedTime =
            parseInt(data.pelanggaran[i].waktu.slice(0, 2), 10) + 7
          return component.push(
            <TableRow key={row.waktu}>
              <TableCell>{i + 1}</TableCell>
              <TableCell component="th" scope="row">
                {row.kamera}
              </TableCell>
              <TableCell>
                {row.lokasi.slice(0, 1).toUpperCase() + row.lokasi.slice(1)}
              </TableCell>
              <TableCell>{parsedTime + row.waktu.slice(2)} WIB</TableCell>
            </TableRow>
          )
        })
      } else {
        for (let i = 0; i < 5; i += 1) {
          const parsedTime =
            parseInt(data.pelanggaran[i].waktu.slice(0, 2), 10) + 7
          component.push(
            <TableRow key={data.pelanggaran[i].waktu}>
              <TableCell>{i + 1}</TableCell>
              <TableCell component="th" scope="row">
                {data.pelanggaran[i].kamera}
              </TableCell>
              <TableCell>
                {data.pelanggaran[i].lokasi.slice(0, 1).toUpperCase() +
                  data.pelanggaran[i].lokasi.slice(1)}
              </TableCell>
              <TableCell>
                {parsedTime + data.pelanggaran[i].waktu.slice(2)} WIB
              </TableCell>
            </TableRow>
          )
        }
      }
    } else {
      component.push(
        <TableRow key="no data">
          <TableCell component="th" scope="row">
            Belum ada data
          </TableCell>
        </TableRow>
      )
    }

    return <>{component}</>
  }

  const showRecommendations = () => {
    const component = []
    const recommendations = {
      safe: ["Rekomendasi aman 1", "Rekomendasi aman 2", "Rekomendasi aman 3"],
      neutral: [
        "Rekomendasi netral 1",
        "Rekomendasi netral 2",
        "Rekomendasi netral 3",
      ],
      unsafe: [
        "Rekomendasi tidak aman 1",
        "Rekomendasi tidak aman 2",
        "Rekomendasi tidak aman 3",
      ],
    }

    recommendations[`${condition}`].map((item) =>
      component.push(
        <ListItem button>
          <ListItemIcon>
            <img src={Logo} alt="Logo" width="36" height="36" />
          </ListItemIcon>
          <ListItemText primary={item} />
        </ListItem>
      )
    )

    return <>{component}</>
  }

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
      <Backdrop
        className={classes.backdrop}
        open={loading}
        style={{ backgroundColor: "rgba(0,0,0,0)" }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
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
                      <Typography variant="h4" style={{ color: "blue" }}>
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
                      <Typography variant="h4" style={{ color: "green" }}>
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
                      <Typography variant="h4" style={{ color: "red" }}>
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
              <h2>
                Rekomendasi DSS
                <Typography variant="subtitle1">status: {condition}</Typography>
              </h2>
            </Grid>
            <Grid container spacing={3} item xs={12}>
              <Grid item xs={12}>
                <List component="nav" aria-label="main mailbox folders">
                  {showRecommendations()}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Kondisi aman: Lebih dari 80% pengunjung bermasker
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Kondisi netral: Antara 50-80% pengunjung bermasker
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Kondisi tidak aman: Kurang dari 50% pengunjung bermasker
                </Typography>
              </Grid>
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
                <TableBody>{showDetails()}</TableBody>
              </Table>
            </TableContainer>
            <br />
            {!seeDetails && data.pelanggaran.length > 5 ? (
              <Button
                color="inherit"
                variant="outlined"
                style={{ textTransform: "none" }}
                onClick={() => setSeeDetails(true)}
              >
                Tampilkan semua data
              </Button>
            ) : (
              <></>
            )}
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

export default App
