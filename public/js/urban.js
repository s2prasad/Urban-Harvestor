$(document).ready(function(){
		$('#1').hide();
		$('#2').hide();
		$('#3').hide();


		$(".donor").click(function(){
			
			var id = $(this).attr("id");
			if(id == 4){
				$('#1').show();
				$('#2').hide();
				$('#3').hide();
			} else if(id == 5){
				$('#1').hide();
				$('#2').show();
				$('#3').hide();
			} else if(id == 6){
				$('#1').hide();
				$('#2').hide();
				$('#3').show();
			}
		});

	});