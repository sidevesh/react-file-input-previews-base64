import React from 'react';

const NonPreviewDefaultComponent = ({title="No Preview", size=null, type=null}) => (
  <div style={{
      backgroundColor:'#FFFFFF',
      height:'30vmin',
      width:'30vmin',
      marginTop:5,
      marginBottom:5,
      marginRight:5,
      boxShadow:"rgba(0, 0, 0, 0.188235) 0px 10px 30px, rgba(0, 0, 0, 0.227451) 0px 6px 10px",
      overflow:'hidden'
    }}
  >
    <div style={{margin:5}}>
      <p style={{margin:0, fontWeight:'500'}}>{title.split('.')[0]}</p>
      <p style={{margin:0}}>{size+" kb"}</p>
      <p style={{margin:0}}>{type!=="" ? type.split('/')[1] : title.split('.')[1]}</p>
    </div>
  </div>
);

export default NonPreviewDefaultComponent;
