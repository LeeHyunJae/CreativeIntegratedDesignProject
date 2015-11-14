for((i = 0; i <= 100; i =(( RANDOM % 100) - 50 ) )); do

	var=$(printf '{"type":"bar","value":%d}' "$i" )
	var1=$(printf '{"type":"line","value":%d}' "$i" )	
	var2=$(printf '{"type":"pie","value":%d}' "$i" )
	
	mosquitto_pub -h "cloud2logic.com" -t "project/test" -m $var
	mosquitto_pub -h "cloud2logic.com" -t "project/test" -m $var1
	#mosquitto_pub -h "cloud2logic.com" -t "project/test" -m $var2
	
	sleep 0.5
done
