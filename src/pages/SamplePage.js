import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue} from "firebase/database";
import Page from 'components/Page';
import React from 'react';
import "firebase/database"
import { Card, CardBody, CardHeader, Row, Col } from 'reactstrap';
import { Line } from 'react-chartjs-2';
import firebase from '../firebase.js';

const dbRef = getDatabase(firebase);
console.log(dbRef)
dbRef.child("sensor").get().then((snapshot) => {
  if (snapshot.exists()) {
    console.log(snapshot.val());
  } else {
    console.log("No data available");
  }
}).catch((error) => {
  console.error(error);
});
const Period = Array.from(Array(1450).keys())
// const Period = [
//   '1','2','3','4','5','6','7','8','9','10',
//   '11','12','13','14','15','16','17','18','19','20',
//   '21','22','23','24','25','26','27','28','29','30',
//   '31','32','33','34','35','36','37','38','39','40',
//   '41','42','43','44','45','46','47','48','49','50',
//   '51','52','53','54','55','56','57','58','59','60',
//   '61','62','63','64','65','66','67','68','69','70',
//   '71','72','73','74','75','76','77','78','79','80',
//   '81','82','83','84','85','86','87','88','89','90',
//   '91','92','93','94','95','96','97','98','99','100',];

var list = [];
var dis_list = [];
var gyro_x_list = [];
var gyro_y_list = [];
var gyro_z_list = [];
var acc_x_list = [];
var acc_y_list = [];
var acc_z_list = [];
var flex_l_list = [];
var flex_r_list = [];
var flex_c_list = [];



class TablePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sensor: [],
      pat_id: null
    };
  };
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ currentUser: user })
        const patid = this.state.currentUser.email.slice(0, 10);
        this.setState({ pat_id: patid })
      }
    });
    this.getData();
    setInterval(this.getData, 10000);

  };
  

  getData = () => {
    const imu_ref = firebase.database().ref('sensor');
    console.log(imu_ref.child(0));
    imu_ref.once('value', (snapshot) => {
      // console.log(snapshot.key);
      let imu_sens = snapshot.val();
      let newimu = [];
      for (let imu_sen in imu_sens) {
        for(var imu_log=0; imu_log<=49; imu_log++){
        newimu.push({
          time: imu_sens[imu_sen].time[imu_log],
          date: imu_sens[imu_sen].date[imu_log],
          gyro_x: imu_sens[imu_sen].gyro_x[imu_log],
          gyro_y: imu_sens[imu_sen].gyro_y[imu_log],
          gyro_z: imu_sens[imu_sen].gyro_z[imu_log],
          acc_x: imu_sens[imu_sen].acc_x[imu_log],
          acc_y: imu_sens[imu_sen].acc_y[imu_log],
          acc_z: imu_sens[imu_sen].acc_z[imu_log],
          distance: imu_sens[imu_sen].distance[imu_log],
          flex_l: imu_sens[imu_sen].flexL[imu_log],
          flex_r: imu_sens[imu_sen].flexR[imu_log],
          flex_c: imu_sens[imu_sen].flexC[imu_log]
        });
        this.setState({ sensor: newimu });
        }
      }
    });
    list = this.state.sensor
    // .slice(this.state.sensor.length-8,this.state.sensor.length);
    dis_list = list.map(item => item.distance);
    gyro_x_list = list.map(item => item.gyro_x);
    gyro_y_list = list.map(item => item.gyro_y);
    gyro_z_list = list.map(item => item.gyro_z);
    acc_x_list = list.map(item => item.acc_x);
    acc_y_list = list.map(item => item.acc_y);
    acc_z_list = list.map(item => item.acc_z);
    flex_l_list = list.map(item => item.flex_l);
    flex_r_list = list.map(item => item.flex_r);
    flex_c_list = list.map(item => item.flex_c);
    

  }
  render() {
    return (
      <Page
        title="Raw Data Dashboard "
        breadcrumbs={[{ name: 'Raw Data', active: true }]}
        className="TablePage"
      >
        <Row>
          <Col xl={6} lg={12} md={12}>
            <Card className="mb-3">
              <CardHeader>Distance Data</CardHeader>
              <CardBody>
                <Line data={genLoadData()} options={loadchartOptions} />
              </CardBody>
            </Card>
          </Col>
          {/* <Col xl={6} lg={12} md={12}>
            <Card className="mb-3">
              <CardHeader>Humidity Data</CardHeader>
              <CardBody>
                <Line data={genHumidData()} options={humchartOptions} />
              </CardBody>
            </Card>
          </Col> */}
        </Row>
        <Row>
          <Col xl={6} lg={12} md={12}>
            <Card className="mb-3">
              <CardHeader>Angular Acceleration Data</CardHeader>
              <CardBody>
                <Line data={genAccelData()} options={accelchartOptions} />
              </CardBody>
            </Card>
          </Col>
          <Col xl={6} lg={12} md={12}>
            <Card className="mb-3">
              <CardHeader>Gyroscope Data</CardHeader>
              <CardBody>
                <Line data={genGyroData()} options={gyrochartOptions} />
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          {/* <Col xl={6} lg={12} md={12}>
            <Card className="mb-3">
              <CardHeader>Humidity Data</CardHeader>
              <CardBody>
                <Line data={genHumidData()} options={humchartOptions} />
              </CardBody>
            </Card>
          </Col> */}
          <Col xl={6} lg={12} md={12}>
            <Card className="mb-3">
              <CardHeader>Flex Data</CardHeader>
              <CardBody>
                <Line data={genTempData()} options={tempchartOptions}
                 />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Page>
    );
  }
};



const genLoadData = () => {
  return {
    labels: Period,
    datasets: [
      {
        label: 'Distance',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: dis_list,
      }
    ],
  };
};

const genGyroData = () => {
  return {
    labels: Period,
    datasets: [
      {
        label: 'Gyroscope X',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: gyro_x_list,
      },
      {
        label: 'Gyroscope Y',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,100,192,0.4)',
        borderColor: 'rgba(75,100,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,100,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,100,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: gyro_y_list,
      },
      {
        label: 'Gyroscope Z',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(140,192,20,0.4)',
        borderColor: 'rgba(140,192,20,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(140,192,20,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(140,192,20,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: gyro_z_list,
      }
    ],
  };
};

const genAccelData = () => {
  return {
    labels: Period,
    datasets: [
      {
        label: 'Accel X',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(15,192,10,0.4)',
        borderColor: 'rgba(15,192,10,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(15,192,10,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(15,192,10,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: acc_x_list,
      },
      {
        label: 'Accel Y',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,200,192,0.4)',
        borderColor: 'rgba(75,200,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,200,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,200,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: acc_y_list,
      },
      {
        label: 'Accel Z',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(140,12,20,0.4)',
        borderColor: 'rgba(140,12,20,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(140,12,20,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(140,12,20,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: acc_z_list,
      }
    ],
  };
};

// const genHumidData = () => {
//   return {

//     labels: Period,
//     datasets: [
//       {
//         label: 'Humidity',
//         fill: false,
//         lineTension: 0.1,
//         backgroundColor: 'rgba(75,0,192,0.4)',
//         borderColor: 'rgba(75,0,192,1)',
//         borderCapStyle: 'butt',
//         borderDash: [],
//         borderDashOffset: 0.0,
//         borderJoinStyle: 'miter',
//         pointBorderColor: 'rgba(75,0,192,1)',
//         pointBackgroundColor: '#fff',
//         pointBorderWidth: 1,
//         pointHoverRadius: 5,
//         pointHoverBackgroundColor: 'rgba(75,0,192,1)',
//         pointHoverBorderColor: 'rgba(220,220,220,1)',
//         pointHoverBorderWidth: 2,
//         pointRadius: 1,
//         pointHitRadius: 10,
//         data: humid_list,
//       }
//     ],
//   };
// };
const genWeeklyData = () => {
  return {
    labels: Period,
    datasets: [{
      label: 'Bad Posture',
      fill: true,
      lineTension: 0.1,
      backgroundColor: 'rgba(140,12,20,0.4)',
      borderColor: 'rgba(140,12,20,1)',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(140,12,20,1)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(140,12,20,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: flex_c_list,
    },
      {
        label: 'Good Posture',
        fill: true,
        lineTension: 0.1,
        backgroundColor: 'rgba(15,192,10,0.4)',
        borderColor: 'rgba(15,192,10,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(15,192,10,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(15,192,10,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: flex_l_list,
      },
      {
        label: 'Stretch',
        fill: true,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,200,192,0.4)',
        borderColor: 'rgba(75,200,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,200,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,200,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: flex_r_list,
      }
      
    ],
  };
};

const genTempData = () => {
  return {
    labels: Period,
    datasets: [
      {
        label: 'Flex Left',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(15,192,10,0.4)',
        borderColor: 'rgba(15,192,10,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(15,192,10,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(15,192,10,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: flex_l_list,
      },
      {
        label: 'Flex Right',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,200,192,0.4)',
        borderColor: 'rgba(75,200,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,200,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,200,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: flex_r_list,
      },
      {
        label: 'Flex Center',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(140,12,20,0.4)',
        borderColor: 'rgba(140,12,20,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(140,12,20,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(140,12,20,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: flex_c_list,
      }
    ],
  };
};

var loadchartOptions = {
  showScale: true,
  pointDot: true,
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true,
        min: 0,
        max: 1000
      },
      scaleLabel: {
        display: true,
        labelString: 'Distance(cm)'
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Recorded Data (from oldest -> newest)'
      }
    }]
  }
}

var accelchartOptions = {
  showScale: true,
  pointDot: true,
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true,
        min: -15,
        max: 15
      },
      scaleLabel: {
        display: true,
        labelString: 'Acceleration (m/s^2)'
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Recorded Data (from oldest -> newest)'
      }
    }]
  }
}

var gyrochartOptions = {
  showScale: true,
  pointDot: true,
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true,
        min: -200,
        max: 200
      },
      scaleLabel: {
        display: true,
        labelString: 'Angular velocity (dps)'
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Recorded Data (from oldest -> newest)'
      }
    }]
  }
}

// var humchartOptions = {
//   showScale: true,
//   pointDot: true,
//   scales: {
//     yAxes: [{
//       ticks: {
//         beginAtZero: true,
//         min: 30,
//         max: 70
//       },
//       scaleLabel: {
//         display: true,
//         labelString: 'Humidity (%)'
//       }
//     }],
//     xAxes: [{
//       scaleLabel: {
//         display: true,
//         labelString: 'Recorded Data (from oldest -> newest)'
//       }
//     }]
//   }
// }

var tempchartOptions = {
  showScale: true,
  pointDot: true,
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true,
        min: 2000,
        max: 4500
      },
      scaleLabel: {
        display: true,
        labelString: 'Flex (volt)'
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Recorded Data (from oldest -> newest)'
      }
    }]
  }
}

var weeklyChartOption = {
  showScale: true,
  pointDot: true,
  scales: {
    yAxes: [{
      ticks: {
        beginAtZero: true,
        min: 2000,
        max: 3000
      },
      scaleLabel: {
        display: true,
        labelString: 'Minute'
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Date'
      }
    }]
  }
}



export default TablePage;
export {genWeeklyData, weeklyChartOption};
