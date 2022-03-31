import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue} from "firebase/database";

import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import Page from 'components/Page';
import React from 'react';
import "firebase/database"
import { Card, CardBody, CardHeader, Row, Col } from 'reactstrap';
import { Line } from 'react-chartjs-2';
import firebase from '../firebase.js';


const dbRef = getDatabase(firebase);

async function getActivity(dbRef) {
    const predictionCol = collection(dbRef, 'prediction');
    const predictionSnapshot = await getDocs(predictionCol);
    const ActivityList = predictionSnapshot.docs.map(doc => doc.data());
    return ActivityList;
  }

  var a = getActivity(dbRef)
  console.log("hi"+a)

