import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import java.util.*;

public class RailwayScheduler extends Application {
    static class Train {
        String name;
        int arrival;
        int departure;
        int platform;
        Train(String name, int arrival, int departure) {
            this.name = name;
            this.arrival = arrival;
            this.departure = departure;
        }
    }

    private List<Train> trains = new ArrayList<>();
    private TextArea outputArea = new TextArea();

    @Override
    public void start(Stage stage) {
        TextField nameField = new TextField();
        nameField.setPromptText("Train Name");
        TextField arrivalField = new TextField();
        arrivalField.setPromptText("Arrival (e.g. 900)");
        TextField departureField = new TextField();
        departureField.setPromptText("Departure (e.g. 1030)");
        Button addBtn = new Button("Add Train");
        Button scheduleBtn = new Button("Assign Platforms");
        addBtn.setOnAction(e -> {
            try {
                String name = nameField.getText();
                int arr = Integer.parseInt(arrivalField.getText());
                int dep = Integer.parseInt(departureField.getText());
                trains.add(new Train(name, arr, dep));
                outputArea.appendText("Added: " + name + "\n");
                nameField.clear();
                arrivalField.clear();
                departureField.clear();
            } catch (Exception ex) {
                outputArea.appendText("Invalid Input!\n");
            }
        });

        scheduleBtn.setOnAction(e -> assignPlatforms());
        VBox root = new VBox(10,
                nameField,
                arrivalField,
                departureField,
                addBtn,
                scheduleBtn,
                outputArea
        );
        Scene scene = new Scene(root, 400, 400);
        stage.setTitle("Railway Platform Scheduling");
        stage.setScene(scene);
        stage.show();
    }
    private void assignPlatforms() {
        trains.sort(Comparator.comparingInt(t -> t.arrival));
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        int platformCount = 0;
        for (Train t : trains) {
            if (!pq.isEmpty() && pq.peek() <= t.arrival) {
                pq.poll(); // reuse platform
            } else {
                platformCount++;
            }
            pq.add(t.departure);
            t.platform = pq.size();
        }

        displayResult(platformCount);
    }
    private void displayResult(int totalPlatforms) {
        outputArea.appendText("\n--- Schedule ---\n");
        for (Train t : trains) {
            outputArea.appendText(
                    t.name + " | Arr: " + t.arrival +
                    " | Dep: " + t.departure +
                    " | Platform: " + t.platform + "\n"
            );
        }
        outputArea.appendText("Total Platforms Needed: " + totalPlatforms + "\n\n");
    }
    public static void main(String[] args) {
        launch();
    }
}