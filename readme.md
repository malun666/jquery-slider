# query slider plugin

## use 

```html

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>

<script src="./jQuery.slider.js"></script>

<style>
  .slider-wrap {
    position: relative;
    height: 30px;
    width: 80%;
    margin: 10px auto;
    padding-top: 10px;
  }
  .slider-handler {
    width: 10px;
    height: 20px;
    border-radius: 5px;
    box-shadow: 1px 1px 9px #09c, -1px -1px 9px #09c;
    background-color: #4df;
    position: absolute;
    left: 0;
    top: 5px;
  }

  .slider-range {
    background-color: #4df;
    border-radius: 5px;
    height: 10px;
  }

  .tt {
    width: 400px;
  }
</style>

<div class="tt"> </div>
<script>
  $(function () {
    $('.tt').slider({
      val: 0,
      min: 0,
      max: 100,
      onChange: function(e, val) {
        $(this).next('span').text(val);
      },
      onLoad: function(e, val) {
        $(this).next('span').text(val);
      }
    });

    setTimeout(()=>{
      $('.tt').slider('setVal', 18);
    }, 1000)
  });
</script>
```

## thanks for helping