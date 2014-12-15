
function drawDot(i, j, color)
{
	var canvas = document.getElementById('field');
	var ctx = canvas.getContext('2d');
	var dotImg = document.getElementById('dot-' + color);
	ctx.drawImage(dotImg, i * 25 - dotImg.width/2, j * 25 - dotImg.height/2);
}

function drawLine(oneDot, anotherDot)
{
	var canvas = document.getElementById('field');
	var ctx = canvas.getContext('2d');

	ctx.beginPath();
    ctx.moveTo(oneDot[0] * 25, oneDot[1] * 25);
    ctx.lineTo(anotherDot[0] * 25, anotherDot[1] * 25);
    ctx.closePath();
    ctx.stroke();
}

function loadDots(stringData)
{
	var jsonData = JSON.parse(stringData);
	for(dotIdx in jsonData)
	{
		drawDot(jsonData[dotIdx][0], jsonData[dotIdx][1], jsonData[dotIdx][2]);
		dotsArray.push(jsonData[dotIdx]);
	}

	//$("#pid2").html('loadDots: ' + jsonData[1]);
}

function clickedAt(x, y)
{
	var dotImg = document.getElementById('dot-blue');
	var i = (aligned(x))/25;
	var j = (aligned(y))/25;

	for(dotIdx in dotsArray)
	{
		if(dotsArray[dotIdx][0] == i && dotsArray[dotIdx][1] == j)
		{
			return;
		}
	}	

	function isFeed()
	{
		var isFeeded = false;
		for (dotIdx in dotsArray)
		{
			var dot = dotsArray[dotIdx];
			if (dot[2] == 'red')
			{
				if (checkIfInClosing(dot) == true)
				{
					dotsArray[dotIdx][2] = 'eaten';
					isFeeded = true;
				}
			}
		}

		return isFeeded;
	}

	function checkIfInClosing(dot)		// dot is red
	{
		var dot_i = dot[0];
		var dot_j = dot[1];

		var leftExists = false;		// supposed to be true if 'dot' has a blue dot from its * side
		var rightExists = false;
		var topExists = false;
		var bottomExists = false;

		var i = dot_i;
		var j = dot_j;
		while (i >= 1)				// looking left side
		{
			i--;
			if (indexOfPoint(closingDots, [i, j, 'blue']) != -1)		// 'blue' set to proper compare
			{
				leftExists = true;
				break;
			}			
		}

		i = dot_i;
		j = dot_j;
		while (i <= n - 1)			// looking right side
		{
			i++;
			if (indexOfPoint(closingDots, [i, j, 'blue']) != -1)
			{
				rightExists = true;
				break;
			}			
		}

		i = dot_i;
		j = dot_j;
		while (j >= 1)				// looking top side
		{
			j--;
			if (indexOfPoint(closingDots, [i, j, 'blue']) != -1)
			{
				topExists = true;
				break;
			}			
		}
		
		i = dot_i;
		j = dot_j;
		while (j <= m - 1)				// looking bottom side
		{
			j++;
			if (indexOfPoint(closingDots, [i, j, 'blue']) != -1)
			{
				bottomExists = true;
				break;
			}			
		}

		if (leftExists && rightExists && topExists && bottomExists)
		{
			var dotIdx = indexOfPoint(dotsArray, dot);
			//dotsArray[dotIdx][2] = 'eaten';
			return true;
		}

		return false;
	}

	function showArray(array)
	{
		var idx;
		var str = '';
		for (idx in array)
		{
			str += array[idx];
			str += '\n';
		}
		alert('array: \n' + str);
	}

	function findAndCutTail(dotsArray)		// cutting path that dublicates itself
	{		
					for (i = 1; i < dotsArray.length - 1; i++)
					{
						if (dotsArray[i - 1][0] == dotsArray[i + 1][0] && dotsArray[i - 1][1] == dotsArray[i + 1][1])
						{
							dotsArray.splice(i, 2);
							return i;
						}
					}
					return -1;
	};

	function checkForClosing()
	{
		if (dotsArray[idxp][3] != dotsArray[idx][3] && dotsArray[idx][4] == 'marked' && dotsArray[idx][3] != -1 && idx != dotsArray[idxp][3])
		{
			// here simple closing found (maybe without red dots)
			closingDots1 = [];			// 1, 2 — branches of walk down
			closingDots2 = [];
			currentIdx = idx;			
			while (dotsArray[currentIdx][3] != -1)
			{
				closingDots1.push(dotsArray[currentIdx]);
				currentIdx = dotsArray[currentIdx][3];
			}

			currentIdx = idxp;
			while (dotsArray[currentIdx][3] != -1)
			{
				closingDots2.push(dotsArray[currentIdx]);
				currentIdx = dotsArray[currentIdx][3];
			}
			closingDots2.push(dotsArray[currentIdx]);
			closingDots2.reverse();
			closingDots = closingDots1.concat(closingDots2);
			//showArray(closingDots);				
			while(findAndCutTail(closingDots) != -1);
			//showArray(closingDots);

			if (isFeed() == true)
			{
				var prevDot = closingDots[0];
				for (dotIdx in closingDots)
				{
					var dot = closingDots[dotIdx];								// closingDots TO SEND TO SERVER
					drawLine(dot, prevDot);
					prevDot = dot;
				}
				drawLine(closingDots[0], closingDots[closingDots.length - 1]);

			}
			else
			{
				return false;
			}
	
			return true;		
		}
		return false;
	}

	function checkCondition()			// if neighbour isn't marked and so on
	{
		return (dotsArray[idx][4] != 'marked' && dotsArray[idx][4] != 'processing' && dotsArray[idx][2] == 'blue');
	}

	function checkNeighbours()			// returns true if found closing
	{
		if ((idx = indexOfPoint(dotsArray, left)) != -1)		
		{
			if (checkCondition())
			{
				dotsArray[idx][4] = 'processing';
				dotsArray[idx][3] = idxp;
				queue.push(dotsArray[idx]);
			}
			else
			{
				if (checkForClosing())
				{
					return true;
				}
			}
		}
		
		if ((idx = indexOfPoint(dotsArray, leftTop)) != -1)		
		{
			if (checkCondition())
			{
				dotsArray[idx][4] = 'processing';
				dotsArray[idx][3] = idxp;
				queue.push(dotsArray[idx]);
			}
			else
			{
				if (checkForClosing())
				{
					return true;
				}
			}
		}

		if ((idx = indexOfPoint(dotsArray, leftBottom)) != -1)		
		{
			if (checkCondition())
			{
				dotsArray[idx][4] = 'processing';
				dotsArray[idx][3] = idxp;
				queue.push(dotsArray[idx]);
			}
			else
			{
				if (checkForClosing())
				{
					return true;
				}
			}
		}

		if ((idx = indexOfPoint(dotsArray, top)) != -1)		
		{
			if (checkCondition())
			{
				dotsArray[idx][4] = 'processing';
				dotsArray[idx][3] = idxp;
				queue.push(dotsArray[idx]);
			}
			else
			{
				if (checkForClosing())
				{
					return true;
				}
			}
		}

		if ((idx = indexOfPoint(dotsArray, bottom)) != -1)
		{
			if (checkCondition())
			{
				dotsArray[idx][4] = 'processing';		
				dotsArray[idx][3] = idxp;
				queue.push(dotsArray[idx]);
			}
			else
			{
				if (checkForClosing())
				{
					return true;
				}
			}
		}

		if ((idx = indexOfPoint(dotsArray, rightTop)) != -1)		
		{
			if (checkCondition())
			{
				dotsArray[idx][4] = 'processing';
				dotsArray[idx][3] = idxp;
				queue.push(dotsArray[idx]);
			}
			else
			{
				if (checkForClosing())
				{
					return true;
				}
			}
		}

		if ((idx = indexOfPoint(dotsArray, right)) != -1)
		{
			if (checkCondition())
			{
				dotsArray[idx][4] = 'processing';
				dotsArray[idx][3] = idxp;
				queue.push(dotsArray[idx]);
			}
			else
			{
				if (checkForClosing())
				{
					return true;
				}
			}
		}

		if ((idx = indexOfPoint(dotsArray, rightBottom)) != -1)	
		{
			if (checkCondition())
			{
				dotsArray[idx][4] = 'processing';
				dotsArray[idx][3] = idxp;
				queue.push(dotsArray[idx]);
			}
			else
			{
				if (checkForClosing())
				{
					return true;
				}
			}
		}

		return false;
	}

	drawDot(i,j, "blue");

	length = dotsArray.push([i, j, "blue", -1]);

	queue = [];
	queue.push([i, j, "blue"]);

	while (queue.length > 0)
	{
		currentLookingForNeighbours = queue.shift();

		var i = currentLookingForNeighbours[0]
		var j = currentLookingForNeighbours[1]

		idxp = indexOfPoint(dotsArray, currentLookingForNeighbours);		// insert word point

		left = [i - 1, j, "blue", -1];
		leftTop = [i -1, j - 1, "blue", -1];		
		leftBottom = [i - 1, j + 1, "blue", -1];
		top  = [i, j - 1, "blue", -1];
		bottom = [i, j + 1, "blue", -1];
		rightTop = [i + 1, j - 1,"blue", -1];
		right = [i + 1, j,"blue", -1];
		rightBottom = [i + 1, j + 1,"blue", -1];

		if (isClosing = checkNeighbours())
		{
			break;
		}

		dotsArray[idxp][4] = 'marked';
	}

	//var d = JSON.stringify(dotsArray);
	str = '';						
	for (dotIdx in dotsArray)
	{
		str += '[' + dotIdx + '] ';
		str += dotsArray[dotIdx];
		str += '<br>';
	}

	for (dotIdx in dotsArray)
	{
		dotsArray[dotIdx][3] = -1;
		dotsArray[dotIdx][4] = '';
	}

	$("#pid").html(str);
}

function indexOfPoint(array, point)
{
	for(dotIdx in array)
	{
		if(compareDots(array[dotIdx], point))
		{
			return dotIdx;
		}
	}	
	return -1;
}

function compareDots(first, second)
{
	if(first[0] == second[0] && first[1] == second[1] && first[2] == second[2])
	{
		return true;
	}

	return false;
}

function movedAt(x, y)
{
	var canvas = document.getElementById('field');
	
	var x_aligned = aligned(x);
	var y_aligned = aligned(y);

	var dotImg = document.getElementById('dot-blue');

	$("#dot-blue-transparent").offset({top: y_aligned + canvas.offsetTop + 1 - dotImg.height/2, left: x_aligned + canvas.offsetLeft + 1 - dotImg.width/2});
}

function aligned(z)
{
	var z_aligned;
	var field_z = z;
	var z_idx = parseInt(field_z / 25, 10);
	var low_z =  (z_idx) * 25;
	var high_z =  (z_idx + 1) * 25;
	if(z < low_z + (high_z - low_z)/2)
	{
		z_aligned = low_z;
	}
	else
	{
		z_aligned = high_z;
	}
	return z_aligned;
}

function myFunc()
{
	$.ajax({url: "http://127.0.0.1:8080/e.json", dataType: "jsonp", success: function(data) 
		{
			alert('1');
			$("#pid").html('s ' + data[0]);
		}});
}

function drawField()
{
	var canvas = document.getElementById('field');
	var ctx = canvas.getContext('2d');
	ctx.lineWidth = 0.5;

	var a = 25;

	n = canvas.width / a;
	m = canvas.height / a;

	ctx.beginPath();
	for(i = 1; i < m; i++)
	{
		ctx.moveTo(0, a*i); 
		ctx.lineTo(canvas.width, a*i);
	}

	for(j = 1; j < n; j++)
	{
		ctx.moveTo(a*j, 0); 
		ctx.lineTo(a*j, canvas.height);
	}
	ctx.moveTo(0, 0);
	ctx.lineTo(0, 0)
	ctx.closePath();
	ctx.stroke();	
}

function bindEvents()
{
$("#field").click(function (e) 
	{
		var canvas = document.getElementById('field');
		clickedAt(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
	});

$("#dot-blue-transparent").click(function (e) 
	{
		var canvas = document.getElementById('field');
		clickedAt(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
	});


$("#field").mousemove(function (e) 
	{
		var canvas = document.getElementById('field');
		movedAt(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
	});

$("#dot-blue-transparent").mousemove(function (e) 
	{
		var canvas = document.getElementById('field');
		movedAt(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
	});
}


setInterval(myFunc, 2000);

drawField();
bindEvents();

var d = '[[1,1,"blue", -1],[2,2,"blue", -1],[9,8,"red", -1],[14,4,"blue", -1],[3,2,"blue", -1],[4,2,"blue", -1],[4,3,"red", -1],[5,3,"red", -1],[6,4,"red", -1],[5,2,"blue", -1],[6,3,"blue", -1],[5,4,"blue", -1],[4,4,"blue", -1]]';
var dotsArray = [];

loadDots(d);
