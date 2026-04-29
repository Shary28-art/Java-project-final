# Java-project-final

# 🚆 NexusRail – Railway Platform Scheduling System

NexusRail is a modern web-based Railway Platform Scheduling System designed to efficiently manage train arrivals, departures, and platform allocation using scheduling algorithms. It provides a professional dashboard UI with analytics, platform mapping, train management, and delay handling.

---

## 📌 Features

### 🚉 Train Management

* Add new train schedules
* Edit existing train details
* Delete train records
* Search trains by number, name, route, or driver

### 🛤️ Smart Platform Allocation

* Automatic platform assignment
* Conflict-free scheduling based on arrival/departure overlap
* VIP / Emergency trains prioritized to Platform 1
* Dynamic reassignment after delays

### 📊 Analytics Dashboard

* Total trains count
* VIP trains count
* Platforms currently used
* Peak traffic hour
* Busiest platform
* Driver workload statistics

### 🌍 City Platform Mapping

* Assign custom platform names for destination cities
* Example: Delhi → Rajdhani Bay

### 📥 Reports

* Export complete train schedule report as `.txt`

### 💾 Local Storage Support

* Automatically saves train data in browser storage
* Data remains after refresh

---

## 🖥️ Tech Stack

* **HTML5**
* **CSS3**
* **JavaScript (Vanilla JS)**
* **LocalStorage API**

---

## 📂 Project Structure

```bash
NexusRail/
│── index.html
│── style.css
│── script.js
│── README.md
```

---

## 🚀 How to Run

1. Download or clone the project.
2. Keep all files in same folder:

   * `index.html`
   * `style.css`
   * `script.js`
3. Double-click `index.html`

OR

Open in browser using Live Server in VS Code.

---

## 📸 Main Modules

### Dashboard

Displays live train schedule in table format.

### Platform View

Shows trains assigned platform-wise.

### Analytics

Displays operational statistics.

### City Mapping

Allows custom platform naming based on destination city.

---

## 🧠 Algorithm Used

### Greedy Scheduling Algorithm

The system checks time overlaps and assigns the lowest available platform.

* Sort trains by arrival time
* Check existing platform conflicts
* Assign minimum free platform

This ensures efficient utilization of platforms.

---

## ⚡ Delay Handling

You can add delay (in minutes) to any train.

System automatically:

* Updates arrival/departure time
* Recalculates platform allocation
* Refreshes dashboard

---

## 🔐 Future Improvements

* Firebase / Database integration
* Real-time railway API
* Admin login system
* AI delay prediction
* SMS / Email notifications

---

## 👨‍💻 Developed By

Team Warriors
Railway Platform Scheduling Project

---

## 📄 License

Free for academic and learning use.

---

## 🎯 Project Goal

To solve real-world railway congestion and platform conflicts using smart scheduling, analytics, and modern UI.   
