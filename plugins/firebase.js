import firebase from 'firebase'

if (!firebase.apps.length) {
  firebase.initializeApp(
    {
      apiKey: "AIzaSyARCriMOXQjhDICOqAPPfu_sVfqhcPpGQ4",
      authDomain: "cookingpj-c1d29.firebaseapp.com",
      projectId: "cookingpj-c1d29",
      storageBucket: "cookingpj-c1d29.appspot.com",
      messagingSenderId: "1041125616797",
      appId: "1:1041125616797:web:2796c0481158f8e7927874",
      measurementId: "G-6WY8N2YHFX"
    }
  )
}
  
export default firebase