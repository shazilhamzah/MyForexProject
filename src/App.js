import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [price, setPrice] = useState();
  const [investment, setInvestment] = useState();
  const [percentage, setPercentage] = useState();
  const [profit, setProfit] = useState();
  const [initialPrice, setInitialPrice] = useState();
  const [inTrade, setInTrade] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const apiKey = "ef01f720efmsh3ef81d82dc68a6bp1e5c4fjsn93cbd25fdfef";
  const apiURL =
    "https://twelve-data1.p.rapidapi.com/price?format=json&outputsize=30&symbol=EUR%2FMXN";
  const headers = {
    "X-RapidAPI-Key": apiKey,
    "X-RapidAPI-Host": "twelve-data1.p.rapidapi.com",
  };

  const fetchPrice = async () => {
    try {
      const response = await fetch(apiURL, {
        method: "GET",
        headers: headers,
      });
      const data = await response.json();
      return data.price;
    } catch (error) {
      console.error("Error fetching price: ", error);
      return null;
    }
  };

  const updatePrice = async () => {
    const fetchedPrice = await fetchPrice();
    setPrice(fetchedPrice);
    if (initialPrice !== null) {
      const newPercentage = (
        ((fetchedPrice - initialPrice) / initialPrice) *
        100
      ).toFixed(5);
      setPercentage(newPercentage);
      const newProfit = ((newPercentage / 100) * investment).toFixed(5);
      setProfit(newProfit);
    }
  };

  const startTimer = () => {
    setTimer(10);
    setIsButtonDisabled(true);
  };

  const onTrade = () => {
    if (!inTrade) {
      setInitialPrice(investment);
      setPercentage(0);
      setProfit(0);
    } else {
      const m = Number(initialPrice)+Number(profit);
      console.log(m);
      const data = {
        "Initial Investment": initialPrice,
        "Profit/Loss Percentage": percentage,
        "Profit/Loss": profit,
        "Final Output":m
      };
      const jsonString = JSON.stringify(data, null, 2); // Pretty print with 2 spaces

      // Create a blob with JSON data
      const blob = new Blob([jsonString], { type: "text/plain" });

      // Create a link element
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "data.txt"; // Set the name of the file

      // Append link to the body and trigger a click event to start download
      document.body.appendChild(link);
      link.click();

      // Cleanup: Remove the link element and revoke the URL object
      document.body.removeChild(link);
      URL.revokeObjectURL(url);


      setInitialPrice(null);
      setPercentage(null);
      setProfit(null);
    }
    setInTrade(!inTrade);
  };

  const onChangeInvestment = (event) => {
    setInvestment(parseFloat(event.target.value));
  };

  const refreshPrice = () => {
    if (!isButtonDisabled) {
      updatePrice();
      startTimer();
    }
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsButtonDisabled(false);
    }
  }, [timer]);

  useEffect(() => {
    const interval = setInterval(updatePrice, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [initialPrice, investment]);

  return (
    <div className="App">
      <h1>EUR/MXN Price</h1>
      {price ? <div id="price">{price}</div> : <p id="price">Loading...</p>}

      <div className="input-section">
        {!inTrade ? (
          <input
            type="number"
            onChange={onChangeInvestment}
            value={investment || ""}
            id="investment"
            placeholder="Enter investment amount"
          />
        ) : null}
        <button onClick={onTrade} className="buy-button">
          {!inTrade ? "Buy" : "Close"}
        </button>
      </div>

      <div className="profit-loss-section">
        {percentage !== undefined ? (
          <div id="profit-loss-percentage">
            Profit/Loss Percentage: {percentage}%
          </div>
        ) : (
          <p id="profit-loss-percentage">Profit/Loss Percentage: N/A</p>
        )}
        {profit !== undefined ? (
          <div id="profit-price">Profit Price: {`${profit}$`}</div>
        ) : (
          <p id="profit-price">Profit Price: N/A</p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="input-section">
          <button
            className="buy-button"
            onClick={refreshPrice}
            style={{ marginTop: 50 }}
            disabled={isButtonDisabled}
          >
            Refresh Price
          </button>
          {isButtonDisabled && (
            <p style={{ marginLeft: 10 }}>Please wait {timer}s</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
