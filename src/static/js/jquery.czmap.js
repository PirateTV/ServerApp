//Author: Jan Matoušek
//Contact: matousek.vr@gmail.com
//License: GPL

$(function(){
    var czechMapOverlap = $('#czechMap-overlap'),
        czechMap = $('#czechMap'); 
    
    // map hover 
    $('.czechMap-area').hover(function(){
        
        czechMapOverlap.attr('src', '/images/czmap/' + $(this).attr('data-img') );
        czechMapOverlap.hide(0).stop(false, true);
        czechMapOverlap.fadeIn(0);
        
    },function(){
        
        czechMapOverlap.attr('src', '/images/czmap/none.png');
        czechMapOverlap.show(0);
    });
    
    // links hover
    $('#czechMapLinks a').hover(function(){
    
        czechMapOverlap.attr('src', '/images/czmap/' + czechMap.find('[href="' + $(this).attr('href') + '"]').attr('data-img') );
        czechMapOverlap.hide(0).stop(false, true);
        czechMapOverlap.fadeIn(0);
        
    },function(){
        
        czechMapOverlap.attr('src', '/images/czmap/none.png');
        czechMapOverlap.show(0);
        
    });
 });