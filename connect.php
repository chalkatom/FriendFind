<?php
    $name = $_POST['name'];
    $pronoun = $_POST['pronoun'];
    $interest1 = $_POST['interest1'];
    $interest2 = $_POST['interest2'];
    $interest3 = $_POST['interest3'];

    //database connection

    $conn = new mysqli('localhost', 'root', '', 'friendfind_db');
    if($conn->connect_error){
        die('Connection Failed  :  '.$conn->connect_error);
    }else{
        echo('Connection Successful!');
        $stmt = $conn->prepare("insert into users(name, pronoun, interest1, interest2, interest3)
            values(?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $name, $pronoun, $interest1, $interest2, $interest3);
        if ($stmt->execute()){
            echo "added user to db successfully...";
        }else{
            echo "error adding user to db:  " .$stmt->error;
        }
        $stmt->close();
        $conn->close();
    }
?>