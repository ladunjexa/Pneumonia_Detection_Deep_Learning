/**
 * Make a prediction on the image that the user has uploaded.
 */

async function model_makePrediction(fn) {
  let image = undefined; // clear the previous image from memory.
  image = $("#analysis_image").get(0); // get the image from the image tag

  // Preprocess the image
  let tensor = tf
    .fromPixels(image)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .div(tf.scalar(255.0))
    .expandDims();

  // Run prediction
  let prediction = await model.predict(tensor).data();
  let top5 = Array.from(prediction)
    .map(function (p, i) {
      return {
        probability: p,
        className: CLASSES[i], // we are selecting the value from the obj
      };
    })
    .sort(function (a, b) {
      return b.probability - a.probability;
    })
    .slice(0, 3);

  // Append the prediction
  $("#prediction-list").append(`<li>${fn}</li>`);

  top5.forEach(function (p) {
    $("#prediction-list").append(
      `<li>${p.className}: ${p.probability.toFixed(3)}</li>`
    );
  });

  // Add a space after the prediction for each image
  $("#prediction-list").append(`<br>`);
}

function model_delay() {
  return new Promise((reslove) => setTimeout(reslove, 200));
}

async function model_delayedLog(item, dataURL) {
  await model_delay();

  $("#analysis_image").attr("src", dataURL);

  console.log(item);
}

async function model_processArray(arr) {
  for (var item of fileList) {
    let reader = new FileReader();
    let file = undefined; // clear the previous file from memory.

    reader.onload = async function () {
      let dataURL = reader.result;

      await model_delayedLog(item, dataURL);
      var fn = file.name;
      $("#prediction-list").empty(); // clear the previous prediction
      await model_makePrediction(fn);
    };

    file = item;
    reader.readAsDataURL(file);
  }
}
