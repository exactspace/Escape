<?php header('Content-Type: text/html; charset=utf-8'); ?>

<!DOCTYPE>

<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<title>Escape</title>
		<style>
			body
			{
			background-color:#1C1C1C;
			}
			
			h1
			{
			color:orange;
			text-align:center;
			}
			
			p
			{
			font-family:"Courier New";
			font-size:18px;
			color:#A1A1A1;
			}
			
			p.messageReg
			{
			font-size:14px;
			color:#FFF;
			}
			
			p.messageBold
			{
			font-size:14px;
			font-weight:bold;
			color:#A1A1A1;
			}
			
			p.messageRed
			{
			font-size:14px;
			font-weight:bold;
			color:#FF4D4D;
			}
			
			p.messageGreen
			{
			font-size:14px;
			font-weight:bold;
			color:#1DF020;
			}
			
			p.messageBlue
			{
			font-size:14px;
			font-weight:bold;
			color:#0088FF;
			}
			
			.centerDiv{
			width:460px;
			border-radius: 5px;
			background:#000000;
			padding:10px;
			height:520px;
			position:absolute;
			margin-top:-260px;
			margin-left:-230px;
			top:50%;
			left:50%;}
			
			.messageBox{
			position:absolute;
			width:430px;
			height:247px;
			margin-left:-215px;
			margin-top:-10px;
			border:0px;
			overflow:auto;
			overflow-y:hidden;
			padding:10px;
			top:50%;
			left:50%;
			}

			#banner {
				width: 475px;
				margin: 0 auto;
			}
		</style>
	</head>
	<body>

	<div id="banner">
		<img src="banner.gif" />
	</div>
		
	<div id="centerDiv" class="centerDiv">
		
		<canvas id="playfield" width='430px'></canvas>

	</div>
	
	<div id="messages" class="messageBox">
	</div>
	
	<div id="stats" style='width:260px;'>
		
			<div id="coord"></div>
		
			<div id="health"></div>
			<div id="food"></div>
			
			<div id="keys"></div>
			<div id="gold"></div>
			
	</div>
	
	

		
	<script type="text/javascript" charset="utf-8" src="dice.js"></script>
	<script type="text/javascript" charset="utf-8" src="escape.js"></script>
		
	
	</body>
</html>