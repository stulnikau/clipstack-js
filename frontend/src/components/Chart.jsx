import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: "# of Movies",
      },
    },
    x: {
      title: {
        display: true,
        text: "IMDB Rating",
      },
    },
  },
};

const Chart = ({ roles }) => {
  // Key-value pairs for chart
  // Key: rating bucket (0-1, 1-2, 2-3, ... 9-10)
  // Value: number of movies in that bucket
  // Include all buckets even if they are empty
  const ratingBuckets = {};
  for (let i = 0; i < 10; i++) {
    ratingBuckets[`${i}-${i + 1}`] = 0;
  }
  roles.forEach((r) => {
    const rating = Math.floor(r.imdbRating);
    ratingBuckets[`${rating}-${rating + 1}`] += 1;
  });

  const labels = Object.keys(ratingBuckets);
  const data = {
    labels,
    datasets: [
      {
        data: Object.values(ratingBuckets),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };
  return (
    <Bar
      options={options}
      data={data}
      height={75}
      style={{ marginBottom: "50px" }}
    />
  );
};

export default Chart;
