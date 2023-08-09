// Fetch JSON data and perform initial actions
d3.json("data/samples.json").then(function (data) {
  // Log the data to the console for inspection
  console.log(data); 

  // Initialize various visualizations using the data
  makeDropdown(data);
  makeMetadata(data, data.names[0]);
  makeBarChart(data, data.names[0]);
  makeBubbleChart(data, data.names[0]);
  buildGauge(data, data.names[0]);
});

// Change Options
// Function to handle dropdown selection change
function optionChanged(val) {
  // Load JSON data again and perform actions based on the selected value
  d3.json("data/samples.json").then(function (data) {
    // Log the data to the console for inspection
    console.log(data);

    // Update various visualizations based on the selected value
    makeMetadata(data, val);
    makeBarChart(data, val);
    makeBubbleChart(data, val);
    buildGauge(data, val);
  });
}
// Dropdown Menu
// Function to create and populate the dropdown menu with participant ID(names)
function makeDropdown(data) {
  for (let i = 0; i < data.names.length; i++) {
    let name = data.names[i];
    // Append an option element with the participant ID to the dropdown menu
    d3.select("#selDataset").append("option").text(name);
  }
}

//Panel Display
// Function to populate the metadata panel based on the selected participant
function makeMetadata(data, val) {
  // Log the data to the console for inspection
  console.log(val);

  // Clear the existing content of the metadata panel
  d3.select("#sample-metadata").html("");

  // Filter the metadata for the selected participant
  let meta = data.metadata.filter(x => x.id == val)[0];
  let keys = Object.keys(meta);

  // Display the metadata key-value pairs as paragraphs in the metadata panel
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    d3.select("#sample-metadata").append("p").text(`${key.toUpperCase()}: ${meta[key]}`);
  }
}

//Bar Chart
// Function to create a horizontal bar chart based on the selected participant's data
function makeBarChart(data, val) {
  let sample = data.samples.filter(x => x.id == val)[0];

  // Slice the top 10 sample values, labels, and IDs
  let sample_values = sample.sample_values.slice(0, 10);
  let otu_labels = sample.otu_labels.slice(0, 10);
  let otu_ids = sample.otu_ids.slice(0, 10);

  // Reverse the arrays for display orientation
  sample_values.reverse();
  otu_labels.reverse();
  otu_ids.reverse();

  // Create a trace for the bar chart
  let trace1 = {
    x: sample_values,
    y: otu_ids.map(x => `OTU: ${x}`),
    hovertext: otu_labels,
    type: 'bar',
    orientation: "h",
    marker: { color: '#008080' }
  };

  // Combine the trace into an array
  let plotly_data = [trace1];

  // Define the layout for the bar chart
  let layout = {
    "title": `Top 10 Bacteria Cultures for ID: ${val}`,
    "xaxis": { 'title': "Number of Bacteria Found" }
  }

  // Create a new Plotly bar chart in the "bar" div
  Plotly.newPlot("bar", plotly_data, layout);
}

// Bubble Chart
// Function to create a bubble chart based on the selected participant's data
function makeBubbleChart(data, val) {
  let sample = data.samples.filter(x => x.id == val)[0];

  // Get sample values, labels, and IDs
  let sample_values = sample.sample_values;
  let otu_labels = sample.otu_labels;
  let otu_ids = sample.otu_ids;
  console.log(sample_values);
  // Create a trace for the bubble chart
  let trace1 = {
    x: otu_ids,
    y: sample_values,
    text: otu_labels,
    mode: 'markers',
      marker: {
      color: otu_ids,
      size: sample_values,
      colorscale: 'Portland',
    }
  };
  
  // Calculate the maximum values for the Y-axis range
  let maxY = Math.max(...sample_values);

  // Combine the trace into an array
  let plotly_data = [trace1];

  // Define the layout for the bubble chart
  let layout = {
    title: `Bacteria Cultures for ID: ${val}`,   
    xaxis: { title: "Bacteria ID" },
    yaxis: { 
      title: "Number of Bacteria Found",
      range: [0, 1.5*maxY]
    },
    height: 600
  }

  // Create a new Plotly bubble chart in the "bubble" div
  Plotly.newPlot("bubble", plotly_data, layout);
}

//Gauge Chart
// Function to build a gauge chart for belly button washing frequency
function buildGauge(data, val) {
  let meta = data.metadata.filter(x => x.id == val)[0];
  let wfreq = meta.wfreq;

  // Calculate average washing frequency
  let wfreq_avg = data.metadata.map(x => x.wfreq).reduce((a, b) => a + b, 0) / data.metadata.length;
  console.log(wfreq_avg.toFixed(0));

  // Create a trace for the gauge chart
  let trace1 = {
    domain: { x: [0, 1], y: [0, 1] },
    value: wfreq,
    title: { text: "" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: wfreq_avg.toFixed(0) },
    gauge: {
      axis: { range: [0, 10] },
      steps: [
        { range: [0, 5], color: "lightgray" },
        { range: [5, 7], color: "gray" }
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 9.75
      }
    }
  }

  // Combine the trace into an array
  let plotly_data = [trace1];

  // Define the layout for the gauge chart
  let layout = {
    "title": `<b>Belly Button Washing Frequency for ID: ${val}</b> <br> Scrubs per Week vs Average`,
  }

  // Create a new Plotly gauge chart in the "gauge" div
  Plotly.newPlot("gauge", plotly_data, layout);
}
