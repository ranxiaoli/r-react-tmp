import React from "react";
import { hot } from "react-hot-loader/root";
// import "./app.css";
import styles from "./app.less";
import close from "./assets/close.png";
import bg from "./assets/green-bottom-bg.svg";
import Btn from "./components/Btn";

function App() {
	return (
		<div className={styles.titleAA}>
			hellrddddansssdfdlf dfldjfeeact
			<img src={close} alt="" />
			<img src={bg} alt="" />
			<Btn />
		</div>
	);
}

export default hot(App);
