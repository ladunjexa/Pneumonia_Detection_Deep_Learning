/**
 * Auxilairy function to simulate a click & implementing on the predict button
 */

const SERVER_URL = "https://ladunjexa.github.io/Pneumonia_Detection_Deep_Learning/";

function simulateClick(el) {
  document.getElementById(el).click();
}

function predictOnLoad() {
  setTimeout(simulateClick.bind(null, "predict-button"), 500);
}

/**
 * Load the model and make predictions on the default image.
 */

let model;
(async function () {
  model = await tf.loadModel(`${SERVER_URL}/models/model.json`); // load the model using tensorflow.js
  $("#analysis_image").attr(
    "src",
    `${SERVER_URL}/assets/media/default_image.jpeg`
  ); // set the default image using "src" attribute of the image tag

  $(".model-loader").hide(); // Hide loading spinner since model is loaded.
  $(".model-results").removeClass("hide"); // Show the results section.
  predictOnLoad(); // Simulate a click on the predict button on the default image.
})();

/**
 * Run prediction on the default image when page loaded.
 */

$("#predict-button").click(async function () {
  let image = undefined;
  image = $("#analysis_image").get(0); // get the image from the image tag

  // Preprocess the image
  let tensor = tf
    .fromPixels(image)
    .resizeNearestNeighbor([224, 224]) // change the image size here
    .toFloat()
    .div(tf.scalar(255.0))
    .expandDims();

  // Run prediction
  let predictions = await model.predict(tensor).data();
  let top5 = Array.from(predictions)
    .map(function (p, i) {
      return {
        probability: p,
        className: CLASSES[i],
      };
    })
    .sort(function (a, b) {
      return b.probability - a.probability;
    })
    .slice(0, 3);

  // Append prediction
  var file_name = "default_image.jpeg";
  $("#prediction-list").append(`<li>${file_name}</li>`);

  top5.forEach(function (p) {
    // ist-style-type:none removes the numbers.
    // https://www.w3schools.com/html/html_lists.asp
    $("#prediction-list").append(
      `<li>${p.className}: ${p.probability.toFixed(3)}</li>`
    );
  });
});

/**
 * Run prediction on the uploaded image.
 */

$("#image-selector").change(async function () {
  fileList = $("#image-selector").prop("files");
  model_processArray(fileList);
});
