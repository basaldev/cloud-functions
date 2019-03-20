import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

const API_KEY = 'AIzaSyBZs-ZG74eee93yp5VHJ6-5-IXQJT2IDiw';
const url = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

exports.ocrFilter = functions.firestore.document('userDocuments/{documentId}').onCreate((snap, context) => {

  const snapshot = snap.data();

  console.log('Incoming');
  console.log(snapshot);

  const payload = {
    requests: [
      {
        image: {
          source: {
            imageUri: snapshot.url
          }
        },
        features: [
          {
            type: 'DOCUMENT_TEXT_DETECTION',
            maxResults: 2
          }
        ]
      }
    ]
  };

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then((ocrData: { responses: Array<{ textAnnotations: Array<{ description: string, locale: string }> }> }) => {

      return snap.ref.set({
        filestackId: snapshot['filestackId'],
        mimetype: snapshot['mimetype'],
        name: snapshot['name'],
        url: snapshot['url'],
        userId: snapshot['userId'],
        orc: {
          data: ocrData.responses[0].textAnnotations[0].description,
          locale: ocrData.responses[0].textAnnotations[0].locale
        }
      });
    })
    .catch(error => console.log(error));
});
