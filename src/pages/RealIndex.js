import database from '../firebase.js';
import { getDatabase, ref, child, get } from "firebase/database";

import { randomNum } from 'utils/demos';
// //import pic - there should be more effective way to do this but...
// import sit_img from 'assets/img/ipc/sit.png';
// import strech1_img from 'assets/img/ipc/strech1.jpg';
// import strech2_img from 'assets/img/ipc/strech2.jpg';
// import strech3_img from 'assets/img/ipc/strech3.jpg';
// import strech4_img from 'assets/img/ipc/strech4.jpg';

import { AnnouncementCard, TodosCard } from 'components/Card';
import HorizontalAvatarList from 'components/HorizontalAvatarList';
import MapWithBubbles from 'components/MapWithBubbles';
import Page from 'components/Page';
import ProductMedia from 'components/ProductMedia';
import SupportTicket from 'components/SupportTicket';
import UserProgressTable from 'components/UserProgressTable';
import { IconWidget, NumberWidget } from 'components/Widget';
import { getStackLineChart, stackLineChartOptions } from 'demos/chartjs';
import {
  avatarsData,
  chartjs,
  productsData,
  supportTicketsData,
  todosData,
  userProgressTableData,
} from 'demos/dashboardPage';
import React from 'react';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import {
  MdBubbleChart,
  MdInsertChart,
  MdPersonPin,
  MdPieChart,
  MdRateReview,
  MdShare,
  MdShowChart,
  MdThumbUp,
  MdThumbDown,
  MdLightbulbOutline
} from 'react-icons/md';
import InfiniteCalendar from 'react-infinite-calendar';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardImg,
  CardText,
  CardDeck,
  CardGroup,
  CardHeader,
  CardTitle,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
  CardImgOverlay,
  Progress,
} from 'reactstrap';
import { getColor } from 'utils/colors';
// import {TablePage, genWeeklyData, weeklyChartOption} from 'pages/SamplePage';
// import {genIpcPieData} from 'pages/ChartPage';
import firebase from '../firebase.js';
import ButtonPage from 'pages/ButtonPage';

//declare database
const db = database;
const dbRef = ref(db);

var list = [];
var activityList = [];
var dateList = [];
var timeList = [];
var tempo = [];
var percentInDay = {
  walk: 0,
  stretch: 0,
  sit: 0,
  stand: 0,
  run: 0,
  good: 0,
  bad: 0
}
var weeklyGoodPosture={
  day1:0,
  day2:0,
  day3:0,
  day4:0,
  day5:0,
  day6:0,
  today:0
}
var weeklyBadPosture={
  day1:0,
  day2:0,
  day3:0,
  day4:0,
  day5:0,
  day6:0,
  today:0
}
var weeklyLabel=[];

const Period = Array.from(Array(20).keys())


//Edit Todo list Data here//
const ipctodosData = [
  { id: 1, title: "Don't forget to stand up every 2 hours"},
  { id: 2, title: 'Have you done your daily upper-body stretch? - Check the recommendation to see our tailored stretch for you.'},
  { id: 3, title: "A good walk a day, keeps the doctor away!"},
  { id: 4, title: "You should jogg at least 3 time this week. YOU CAN DO IT!"},
  { id: 5, title: "Be mindfulness on your posture."},
];


class DashboardPage extends React.Component {
    constructor(props) {
        super(props);
      };
      
    componentDidMount() {
    // this is needed, because InfiniteCalendar forces window scroll
    window.scrollTo(0, 0);
    this.getData();
    setInterval(this.getData, 10000);
  }

  state = {
    rSelected: null,
    cSelected: [],
    prediction: [],
    section1val : 'loading..',
    section2val : 'loading..',
    section3val : 'loading..',
    section4val : 'loading..',
    section5val : 'loading..',
    section6val : 'loading...',
    section7val : 'loading...'
  };
 
  getData = () => {
  
    const prediction_array = get(child(dbRef, `prediction`)).then((snapshot) => {
        if (snapshot.exists()) {
            // console.log("im snapshot");
          // console.log(snapshot.val());
        
          let predictionVal = snapshot.val();
          let predictionArray = [];
          for (let i in predictionVal) {
            predictionArray.push({
            activity: predictionVal[i].activity,
            time: predictionVal[i].time,
            date: predictionVal[i].date,
            });
            this.setState({ prediction: predictionArray });
          }       
    // store each column of prediction      
    list = this.state.prediction
    activityList = list.map(item => item.activity);
    dateList = list.map(item => item.date);
    timeList = list.map(item => item.time);
        } 
        else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });

      var len = activityList.length
   
      if(timeList[len-1] !== undefined){
      // section1val - update to current activity name
      this.setState({section1val: activityList[len-1]});
     
      //section2val - check same activity + update duration
      var couSameAcc = 0;
      for(var i=1; i<=len; i++){
        if(activityList[len-1]===activityList[len-1-i]){
          couSameAcc = i;
        }
        else{i=len;}
      }
      const current = new Date();

      const timeNow = current.getSeconds()+current.getMinutes()*60+current.getHours()*3600;
      var timeDiff;
      if(couSameAcc===0){
        timeDiff = timeDifference(true, timeNow, timeList[len-1]);
      }
      else{timeDiff = timeDifference(false, timeList[len-1-couSameAcc], timeList[len-1]);}
      this.setState({section2val: timePretty(timeDiff)});
      
      //section3val - determine warning message
      this.setState({section3val:messageBanner(timeDiff, activityList[len-1])});

      //section4val - bg color of message messageBanner
      var isGoodPosture = checkPosture(activityList[len-1]);
      this.setState({section4val: bgColorFromPosture(isGoodPosture)});

      //gen pie data & banner good vs bad - list of percent 
      resetPercentInDay();
      resetWeeklyData();
      weeklyLabel=[];
      var indexSameDay = len-1;
      
      //cal today and weekly data
tempo=[];
      for(var day=7;day>0;day--){
        for(var j=indexSameDay;j>=0;j--){
          if(dateList[indexSameDay]===dateList[j]){
            if(!weeklyLabel.includes(dateList[j])){weeklyLabel.push(dateList[j])}
            if(day==7){
              countGoodBad(day, activityList[j]);
              countActivityInDay(activityList[j]);
            }
            else{
              countGoodBad(day, activityList[j]);
            }
          }
          else{
            indexSameDay = j;
            console.log("in else "+indexSameDay);
            j = -1;
          }
        }
      }
      for(var index=0;index<3;index++){
        var temp=weeklyLabel[index];
        weeklyLabel[index] = weeklyLabel[6-index];
        weeklyLabel[6-index] = temp;
      }
      console.log("know list"+ weeklyLabel);
      percentInDay = genPercentInDay(percentInDay);
      if(percentInDay.good>=percentInDay.bad){
        console.log("in good bg");
        this.setState({section5val: bgColorFromPosture(true)});}
      else{this.setState({section5val: bgColorFromPosture(false)});}

      //section6val - In-baner sugestion
      this.setState({section6val: messageBannerSuggestion(timeDiff, activityList[len-1])});
      //section7val - realtime recomendation
      this.setState({section7val:messageRealtimeSuggestion(timeDiff, activityList[len-1])});
      }

    

      


  }

  

  render() {
    return (
      <Page className="DashboardPage" title="Dashboard" breadcrumbs={[{ name: 'Dashboard', active: true }]}>

{/* box#1 */}
        <Row>
        <Col md={12} sm={12} xs={12} className="mb-3">
          <Card className="flex-row">
                <Col md={4} sm={6} xs={6} className="m-3">
                    <CardImg
                      className="card-img-left"
                    //   src={sit_img}
                      style={{ width: 'auto', height: 300, display: 'block', margin: 'auto', marginBottom: '20px'}}
                    />
                    <CardTitle>
                      <h4 className="text-center">
                        <strong>Current Activity :</strong>
                      </h4>
                    </CardTitle>
                      <h2 className="text-center" id="activityName">{this.state.section1val}</h2>
                      <h4 className="text-center" id="timeDuration">{this.state.section2val}</h4>
                </Col>
                
                <Col md={8} sm={6} xs={6} className="m-5">
                  <Row>
                    <Col md={10} sm={10} xs={10} className="m-5">
                      <IconWidget
                        bgColor={this.state.section4val}
                        icon={MdThumbDown}
                        title={<h3 className="text-center"> <strong> {this.state.section3val} </strong> </h3>}
                        subtitle={<h4 className="text-center">{this.state.section6val}</h4>}
                      />
                      <Card className="flex">
                        <CardBody>
                          <CardTitle><h4><strong>Real time suggestion:</strong></h4></CardTitle>
                          <CardText>{this.state.section7val}</CardText>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>  
                </Col>
          </Card>
        </Col>
        </Row>
{/* end of box#1 */}  


{/* box#3 */}
        <Row>
        <Col xl={12} lg={12} md={12}>
          <Card>

            <CardHeader>
              <h5><strong>Today Summary</strong></h5>
              <h6>Your activity since 00:00 today</h6>
            </CardHeader>

            <CardBody>
              <Row>
                <Col xl={7} lg={12} md={12}>
                  <Pie data={genPieData()} />
                </Col>
                <Col xl={4} lg={12} md={12}>
                  <Col className="mb-4 mt-2">
                      <IconWidget
                      bgColor="white"
                      inverse={false}
                      icon={MdThumbUp}
                      title="Good Posture"
                      subtitle={percentInDay.good+"%"}
                      />
                  </Col>
                  <Col className="mb-2 mt-2">
                      <IconWidget
                      bgColor="white"
                      inverse={false}
                      icon={MdThumbDown}
                      title="Bad Posture"
                      subtitle={percentInDay.bad+"%"}
                      />
                  </Col>
                  <Col className="mb-2 mt-2">
                      <IconWidget
                      bgColor={this.state.section5val}
                      icon={MdLightbulbOutline}
                      title={<h4> <strong> Keep up the good posture! </strong></h4>}
                      />
                  </Col>
                </Col>
                <Col xl={1} lg={12} md={12}></Col>
              </Row>
            </CardBody>

          </Card>
        </Col>
        
       
        </Row>
{/* end of box#3 */} 

{/* box#4 */}
        <Row>
        <Col xl={12} lg={12} md={12}>
            <Card className="mb-3">
              <CardHeader><h5><strong>Activity History</strong></h5></CardHeader>
            <CardBody>
              <Bar data={genLineData()} />
            </CardBody>
            </Card>
        </Col>

        </Row>
{/* end of box#4 */} 

{/* box#2 */}
<Row> 
        <Col lg="12" md="12" sm="12" xs="12">
        <Card>
        <CardHeader><h5><strong>Today You Should...</strong> </h5> <h6>This is generated base on your past 7 days activities. Here is what we suggest you to do today.</h6></CardHeader>
          <CardBody>
                <Col md={12}>
                  <Row>
                    <Col lg="6" md="12" sm="12" xs="12">
                      <Button color="primary" size="lg" block active>
                      <strong>Have a good walk at least 10 minutes.</strong>
                      </Button>
                      <Button color="primary" size="lg" block active>
                      <strong>Stretch your upper-body for 10 minutes</strong> <Badge color="success" pill className="mr-1">DONE</Badge><br></br> Check the recommendation to see our tailored stretch for you. 
                      </Button>
                      <Button color="primary" size="lg" block active>
                      <strong>Jog at least 20 minutes</strong> <Badge color="success" pill className="mr-1">DONE</Badge>
                      </Button>
                    </Col>
                    <Col lg="6" md="12" sm="12" xs="12">
                      <Button color="warning" size="lg" block >
                      <strong>Not hunch your back for more than 10 mins</strong> <Badge color="danger" pill className="mr-1">FAIL</Badge>
                      </Button>
                      <Button color="primary" size="lg" block active>
                      <strong>Stand up and walk around every 2 hours</strong> <br></br>We notice that you've been stting for too long.
                      </Button>
                    </Col>
                  </Row>
                </Col>
          </CardBody>
        </Card> 
        </Col>
        </Row>
{/* end of box#2 */} 


        <Row>
        <Col xl={12} lg={12} md={12}>
        <CardHeader><h5><strong>Recommendations</strong></h5><h6>Base on your activity preference.</h6></CardHeader>
          <Card className="flex-row">
            <CardImg
              className="card-img-left"
            //   src={strech2_img}
              style={{ width: 'auto', height: 150 }}
            />
            <CardBody>
              <CardTitle><h6><strong>Hamstrings</strong></h6>
                <Badge color="primary" className="m-1">
                  Yoga
                </Badge>
              </CardTitle>
              <CardText>
              Stand split stance and put both of your hands on the knee in front
               of you and keep the other knee straight, push your hip forwards and down 
               keeping your back straight.Place the hands on the top of the hip for support. 
               Hold the stretch for 30 seconds and then switch to other side and repeat the steps.
              </CardText>
            </CardBody>
          </Card>
          <Card className="flex-row">
            <CardImg
              className="card-img-left"
            //   src={strech1_img}
              style={{ width: 'auto', height: 150 }}
            />
            <CardBody>
              <CardTitle><h6><strong>Upper Back Stretch</strong></h6>
              <Badge color="info" className="m-1">
                  Body Weight
                </Badge>
                <Badge color="primary" className="m-1">
                  Yoga
                </Badge>
                </CardTitle>
                
              <CardText>
              interlock your fingers behind your back, then lift your arms so you feel a 
              stretch in your chest and front shoulders. Draw your chin down to avoid crunching the neck.
              </CardText>
            </CardBody>
          </Card>
          <Card className="flex-row">
            <CardImg
              className="card-img-left"
            //   src={strech3_img}
              style={{ width: 'auto', height: 150 }}
            />
            <CardBody>
              <CardTitle><h6><strong>Wrists and forearm</strong></h6>
              <Badge color="warning" className="m-1">
                  Meditaion
                </Badge>
                <Badge color="primary" className="m-1">
                  Yoga
                </Badge>
              </CardTitle>
              <CardText>
              Perform a prayer stretch (Buddha stretch) by placing your fingers and palms 
              together with your hands in front of your chest and fingers pointing upward. 
              While keeping your palms together and having your elbows away from the body, 
              you should slowly lower your hands until you feel a good stretch around your wrists. 
              Hold for five seconds.
              </CardText>
            </CardBody>
          </Card>
          <Card className="flex-row">
            <CardImg
              className="card-img-left"
            //   src={strech4_img}
              style={{ width: 'auto', height: 150 }}
            />
            <CardBody>
              <CardTitle><h6><strong>Hip Flexors</strong></h6>
                <Badge color="success" className="m-1">
                  Cardio
                </Badge>
                </CardTitle>
              <CardText>
              Stand tall with back straight, abs engaged, shoulders down, and feet hip-width apart. 
              Bring your left leg forward, heel down, toes up and leg straight. Keeping back straight 
              and abs engaged, bend the right knee as if sitting back, while supporting yourself with 
              both hands on your thighs. Breathe deeply and hold for 10-30 seconds. Switch legs and repeat 
              on the other side.
              </CardText>
            </CardBody>
          </Card>
        </Col>
        </Row>
       
    
      </Page>
    );
  }
}


//functions
  function timeDifference(now, compare, latest){
    var latestSeconds = (parseInt(latest[0].concat(latest[1]))*3600)+(parseInt(latest[3].concat(latest[4]))*60)+(parseInt(latest[6].concat(latest[7])));
    var timeDiff;
    if(now){
      timeDiff = compare - latestSeconds
    }
    else{
      var compareSeconds = (parseInt(compare[0].concat(compare[1]))*3600)+(parseInt(compare[3].concat(compare[4]))*60)+(parseInt(compare[6].concat(compare[7])));
      timeDiff = latestSeconds - compareSeconds;
    }
    console.log("in time cal "+timeDiff);
    // timeDiff =4203; //1h 10min 3sec
    return(timeDiff)
  }

  function timePretty(timeSeconds) {
    if(timeSeconds<60){
      return("Duration: "+timeSeconds+"s");
    }
    else if(timeSeconds<(60*60)){
      return("Duration: "+Math.floor(timeSeconds/60)+"m"+timeSeconds%60+"s");
    }
    else if(timeSeconds<(24*60*60)){
      return("Duration: "+Math.floor(timeSeconds/3600)+"h"+Math.floor((timeSeconds%3600)/60)+"m"+timeSeconds%60+"s");
    }
  }

  function messageBanner(timeSeconds, currentActivity) {
    var message = "";
    if(currentActivity.toLowerCase().includes("sit") && timeSeconds>(30*60)){
        message = message.concat("Sit too long");
    }
    if(currentActivity.toLowerCase().includes("stand") && timeSeconds>(30*60)){
      message = message.concat("Stand too long");
    }
    if(currentActivity.toLowerCase().includes("walk") && timeSeconds>(120*60)){
      message = message.concat("Walk too long");
    }
    if(currentActivity.toLowerCase().includes("run") && timeSeconds>(120*60)){
      message = message.concat("Run too long");
    }
    if(currentActivity.toLowerCase().includes("sit") && timeSeconds<=(30*60)){
      message = message.concat("Sit");
    }
    if(currentActivity.toLowerCase().includes("stand") && timeSeconds<=(30*60)){
      message = message.concat("Stand");
    }
    if(currentActivity.toLowerCase().includes("walk") && timeSeconds<=(30*60)){
      message = message.concat("Walk");
    }
    if(currentActivity.toLowerCase().includes("run") && timeSeconds<=(30*60)){
      message = message.concat("Run");
    }
    if(currentActivity.toLowerCase().includes("hunch")){
      message = message.concat(" in bad posture");
    }
    if(currentActivity.toLowerCase().includes("stretch") && timeSeconds>(30*60)){
      message = message.concat("good job on the stretch!");
    }
    console.log("in mess "+ message);
    return(message);
  }

  function checkPosture(currentActivity){
    if(currentActivity.toLowerCase().includes("hunch")){
      return (false);
    }
    else{return(true);}
  }

  function bgColorFromPosture(isGood){
    if(isGood){
      return("success");  
    }
    else{
    return("danger");}
  }

  function resetPercentInDay(){
    percentInDay.walk=0;
    percentInDay.stretch=0;
    percentInDay.sit=0;
    percentInDay.stand=0;
    percentInDay.run=0;
    percentInDay.good=0;
    percentInDay.bad=0;
  }

  function resetWeeklyData(){
    weeklyGoodPosture.day1=0;
    weeklyGoodPosture.day2=0;
    weeklyGoodPosture.day3=0;
    weeklyGoodPosture.day4=0;
    weeklyGoodPosture.day5=0;
    weeklyGoodPosture.day6=0;
    weeklyGoodPosture.today=0;
    weeklyBadPosture.day1=0;
    weeklyBadPosture.day2=0;
    weeklyBadPosture.day3=0;
    weeklyBadPosture.day4=0;
    weeklyBadPosture.day5=0;
    weeklyBadPosture.day6=0;
    weeklyBadPosture.today=0;
  }

  function countActivityInDay(activity){
  if(activity.toLowerCase().includes("straight")){percentInDay.good++;}
  if(activity.toLowerCase().includes("hunch")){percentInDay.bad++;}

  if(activity.toLowerCase().includes("walk")){percentInDay.walk++;}
  if(activity.toLowerCase().includes("stretch")){percentInDay.stretch++;percentInDay.good++;}
  if(activity.toLowerCase().includes("sit")){percentInDay.sit++;}
  if(activity.toLowerCase().includes("stand")){percentInDay.stand++;}
  if(activity.toLowerCase().includes("run")){percentInDay.run++;}
  }

  function genPercentInDay(percentCou){
    var sum = percentCou.sit + percentCou.walk + percentCou.stand + percentCou.run + percentCou.stretch;
    console.log("in func sum"+sum);
    percentCou.sit = (percentCou.sit/sum)*100; 
    percentCou.walk = (percentCou.walk/sum)*100; 
    percentCou.stand = (percentCou.stand/sum)*100; 
    percentCou.run = (percentCou.run/sum)*100; 
    percentCou.stretch = (percentCou.stretch/sum)*100; 
    percentCou.good = ((percentCou.good/sum)*100).toFixed(0); 
    percentCou.bad = ((percentCou.bad/sum)*100).toFixed(0);
    return(percentCou);
  }

  function isWithinWeek(current, check){
    // "2022-04-02"
    var currentDate = parseInt(current[8].concat(current[9]));
    var currentMonth = parseInt(current[5].concat(current[6]));
    var checkDate = parseInt(check[8].concat(check[9]));
    var checkMonth = parseInt(check[5].concat(check[6]));

    //too lazy,,, assume 31 day a month
    if(currentDate<7){
      if(currentMonth===checkMonth){return (true);}
      else{
        var left = 7 - currentDate;
        if(checkDate>(31-left)){return (true);}
      }
    }
    else{
      if(checkDate>(currentDate-7)){return (true);}
    }
    return (false);
  }

  function countGoodBad(day, activity){
    console.log("countGoodBad"+day);

    if(day === 7){
      
      if(activity.toLowerCase().includes("straight")){weeklyGoodPosture.today++;}
      else if(activity.toLowerCase().includes("hunch")){weeklyBadPosture.today++;}
      else if(activity.toLowerCase().includes("stretch")){weeklyGoodPosture.today++;}
      
    }
    else if(day === 6){
      // tempo.push(activity.toLowerCase());
      if(activity.toLowerCase().includes("straight")){weeklyGoodPosture.day6++;}
      else if(activity.toLowerCase().includes("hunch")){weeklyBadPosture.day6++;}
      else if(activity.toLowerCase().includes("stretch")){weeklyGoodPosture.day6++;}
    }
    else if(day === 5){
      if(activity.toLowerCase().includes("straight")){weeklyGoodPosture.day5++;}
      else if(activity.toLowerCase().includes("hunch")){weeklyBadPosture.day5++;}
      else if(activity.toLowerCase().includes("stretch")){weeklyGoodPosture.day5++;}
    }
    else if(day === 4){
      if(activity.toLowerCase().includes("straight")){weeklyGoodPosture.day4++;}
      else if(activity.toLowerCase().includes("hunch")){weeklyBadPosture.day4++;}
      else if(activity.toLowerCase().includes("stretch")){weeklyGoodPosture.day4++;}
    }
    else if(day === 3){
      if(activity.toLowerCase().includes("straight")){weeklyGoodPosture.day3++;}
      else if(activity.toLowerCase().includes("hunch")){weeklyBadPosture.day3++;}
      else if(activity.toLowerCase().includes("stretch")){weeklyGoodPosture.day3++;}
    }
    else if(day === 2){
      if(activity.toLowerCase().includes("straight")){weeklyGoodPosture.day2++;}
      else if(activity.toLowerCase().includes("hunch")){weeklyBadPosture.day2++;}
      else if(activity.toLowerCase().includes("stretch")){weeklyGoodPosture.day2++;}
    }
    else if(day === 1){
      if(activity.toLowerCase().includes("straight")){weeklyGoodPosture.day1++;}
      else if(activity.toLowerCase().includes("hunch")){weeklyBadPosture.day1++;}
      else if(activity.toLowerCase().includes("stretch")){weeklyGoodPosture.day1++;}
    }

  }

  function messageRealtimeSuggestion(timeSeconds, currentActivity) {
    var message = "";
    if(currentActivity.toLowerCase().includes("straight")&& timeSeconds<=(30*60)){
      message = ("Keep going! You already stay in a good posture.")
    }
    if(currentActivity.toLowerCase().includes("hunch")&& timeSeconds<=(30*60)){
      message = ("You have been staying in bad posture. This can lead to excess pressure on the spine, causing pain. We sugest you to fix your posture.")
    }
    if(currentActivity.toLowerCase().includes("sit") && timeSeconds>(30*60)){
        message = message.concat("You have been stting for to long, that is unhealty for your lower back and blood circulation in your appendage. Your body is not meant for long periods of inactivity. We suggest to try standing up and relax your body for at least 5 minutes.");
    }
    if(currentActivity.toLowerCase().includes("walk") && timeSeconds>(30*60)){
      message = message.concat("You have been walking for too long! This could damange your back. We suggest you to straighten your back while walking");
    }
    if(currentActivity.toLowerCase().includes("stand") && timeSeconds>(30*60)){
      message = message.concat("Your body is not meant for long periods of inactivity. Our bodies can adapt to almost all physical activities we put ourselves through. With inactivity, the adaptation of the body to this inactivity is what causes hunch back posture problems to arise.");
    }
    if(currentActivity.toLowerCase().includes("stretch") && timeSeconds>(30*60)){
      message = message.concat("Strecting is good for");
    }
    if(timeSeconds>(30*60)){
      message = message.concat(" And don't forget to change your activity from time to time")
    }
    if(timeSeconds<=(30*60)){
      message = message.concat(" And keep moving around to aviod inactivity.")
    }

    return(message);
  } 

  function messageBannerSuggestion(timeSeconds, currentActivity) {
    var message = "";
    if(currentActivity.toLowerCase().includes("straight")){
      message = ("Nice one!")
    }
    if(currentActivity.toLowerCase().includes("hunch")){
      message = ("Heads up! Time to fix your posture.")
    }
    if(currentActivity.toLowerCase().includes("sit") && timeSeconds>(30*60)){
        message = message.concat("Let's stand up and have a short walk.");
    }
    if(currentActivity.toLowerCase().includes("stand") && timeSeconds>(30*60)){
      message = message.concat(" Let's move around and get some fresh air.");
    }
    if(currentActivity.toLowerCase().includes("walk") && timeSeconds>(30*60)){
      message = message.concat(" Let's find a place you can sit down.");
    }
    if(currentActivity.toLowerCase().includes("run") && timeSeconds>(60*60)){
      message = message.concat(" Let's have a break, long cardio is unhealty for your heart.");
    }
    if(currentActivity.toLowerCase().includes("stretch") && timeSeconds>(30*60)){
      message = ("Good choice! Let's keep stretching");
    }

    return(message);
  }
  //data for each graph
  const genPieData = () => {
    return {
      datasets: [
        {
          data: [percentInDay.walk, percentInDay.stretch, percentInDay.sit, percentInDay.stand, percentInDay.run],
          backgroundColor: [
            getColor('primary'),
            getColor('secondary'),
            getColor('success'),
            getColor('info'),
            getColor('danger'),
          ],
          label: 'Dataset 1',
        },
      ],
      labels: ['walk', 'stretch', 'sit', 'stand', 'run'],
    };
  };

  // const genWeeklyData = () => {
  //   return {
  //     labels: Period,
  //     datasets: [{
  //       label: 'Bad Posture',
  //       fill: true,
  //       lineTension: 0.1,
  //       backgroundColor: 'rgba(140,12,20,0.4)',
  //       borderColor: 'rgba(140,12,20,1)',
  //       borderCapStyle: 'butt',
  //       borderDash: [],
  //       borderDashOffset: 0.0,
  //       borderJoinStyle: 'miter',
  //       pointBorderColor: 'rgba(140,12,20,1)',
  //       pointBackgroundColor: '#fff',
  //       pointBorderWidth: 1,
  //       pointHoverRadius: 5,
  //       pointHoverBackgroundColor: 'rgba(140,12,20,1)',
  //       pointHoverBorderColor: 'rgba(220,220,220,1)',
  //       pointHoverBorderWidth: 2,
  //       pointRadius: 1,
  //       pointHitRadius: 10,
  //       data: flex_c_list,
  //     },
  //       {
  //         label: 'Good Posture',
  //         fill: true,
  //         lineTension: 0.1,
  //         backgroundColor: 'rgba(15,192,10,0.4)',
  //         borderColor: 'rgba(15,192,10,1)',
  //         borderCapStyle: 'butt',
  //         borderDash: [],
  //         borderDashOffset: 0.0,
  //         borderJoinStyle: 'miter',
  //         pointBorderColor: 'rgba(15,192,10,1)',
  //         pointBackgroundColor: '#fff',
  //         pointBorderWidth: 1,
  //         pointHoverRadius: 5,
  //         pointHoverBackgroundColor: 'rgba(15,192,10,1)',
  //         pointHoverBorderColor: 'rgba(220,220,220,1)',
  //         pointHoverBorderWidth: 2,
  //         pointRadius: 1,
  //         pointHitRadius: 10,
  //         data: flex_l_list,
  //       },
  //       {
  //         label: 'Stretch',
  //         fill: true,
  //         lineTension: 0.1,
  //         backgroundColor: 'rgba(75,200,192,0.4)',
  //         borderColor: 'rgba(75,200,192,1)',
  //         borderCapStyle: 'butt',
  //         borderDash: [],
  //         borderDashOffset: 0.0,
  //         borderJoinStyle: 'miter',
  //         pointBorderColor: 'rgba(75,200,192,1)',
  //         pointBackgroundColor: '#fff',
  //         pointBorderWidth: 1,
  //         pointHoverRadius: 5,
  //         pointHoverBackgroundColor: 'rgba(75,200,192,1)',
  //         pointHoverBorderColor: 'rgba(220,220,220,1)',
  //         pointHoverBorderWidth: 2,
  //         pointRadius: 1,
  //         pointHitRadius: 10,
  //         data: flex_r_list,
  //       }
        
  //     ],
  //   };
  // };

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  const genLineData = (moreData = {}, moreData2 = {}) => {
    return {
      labels: weeklyLabel,
      datasets: [
        {
          label: 'Good Posture',
          backgroundColor: getColor('primary'),
          borderColor: getColor('primary'),
          borderWidth: 1,
          data: [
            weeklyGoodPosture.day1,
            weeklyGoodPosture.day2,
            weeklyGoodPosture.day3,
            weeklyGoodPosture.day4,
            weeklyGoodPosture.day5,
            weeklyGoodPosture.day6,
            weeklyGoodPosture.today,
          ],
          ...moreData,
        },
        {
          label: 'Bad Posture',
          backgroundColor: getColor('secondary'),
          borderColor: getColor('secondary'),
          borderWidth: 1,
          data: [
            weeklyBadPosture.day1,
            weeklyBadPosture.day2,
            weeklyBadPosture.day3,
            weeklyBadPosture.day4,
            weeklyBadPosture.day5,
            weeklyBadPosture.day6,
            weeklyBadPosture.today,
          ],
          ...moreData2,
        },
      ],
    };
  };

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
  
  
export default DashboardPage;
