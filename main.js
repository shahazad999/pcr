import React, { Component } from 'react';
import Button from 'terra-button/lib/Button';
import Card from 'terra-card/lib/Card';
import Input from 'terra-form-input';
import ApplicationMenuName from 'terra-application-name/lib/ApplicationMenuName';
import img from './cerner.png';
import Image from 'terra-image';
import IconAlert from 'terra-icon/lib/icon/IconAlert'
import LabelValueView from 'terra-clinical-label-value-view/lib/LabelValueView';
import ItemDisplay from 'terra-clinical-item-display';
import Checkbox from 'terra-form-checkbox';
import Divider from 'terra-divider';
import DynamicGrid from 'terra-dynamic-grid/lib/DynamicGrid';



// dividng the regions in the webpage
const template = {
    'grid-template-columns': '1fr 1fr',
    'grid-template-rows': 'auto',
    'grid-gap': '1px',
  };
  
  const region1 = {
    'grid-column-start': 1,
    'grid-row-start': 2,
  };
  
  const region2 = {
    'grid-column-start': 2,
    'grid-row-start': 2,
  };
  const region3 = {
    'grid-column-start': 1,
    'grid-column-end': 3,
    'grid-row-start': 1,
  };


class Main extends Component {
    constructor(props){
        super(props);
        this.state = {
            'username': '', 'password':'' , isLoggedIn : false, isUserValid: false,
            'items': [], 'hash' : '',  'id': '', hostIP: '10.182.71.25', port: '',
            'auth' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjM2MDE1NDIzNjAxNjksInVzZXJuYW1lIjoiUGF5ZXIiLCJvcmdOYW1lIjoiT3JnMiIsImlhdCI6MTU0MjM2MDE2OX0.FzaNkJWmY1LsXpoMZqCOdE4nS8Vybz8YO1gcXJ7M-fc', 
            fetchError: 0, 'toutput': [] ,'foutput' : [], view: false, disableHashInput: false,
            fhirUrl: '', Holder: 'Enter a valid Hash provided in the claim', 
            fhirResponse: '',
            totalFhirResponse: '',
            selectedAnswers:[], isOpen: false
        }
        this.handleChangeUsername= this.handleChangeUsername.bind(this)
        this.handleChangePassword= this.handleChangePassword.bind(this)
        this.handleSubmit=this.handleSubmit.bind(this)
        this.handleLogout= this.handleLogout.bind(this)
        this.handleChangeHash= this.handleChangeHash.bind(this) 
        this.handleSubmitQuery = this.handleSubmitQuery.bind(this)
        this.reset= this.reset.bind(this)
    }

    componentDidUpdate() {
        var {hash, Holder} = this.state;
        var len = hash.length;
        
        if (len > 33) {
          this.fetchData()

        } 
        const {selectedAnswers, view} = this.state;
        if (selectedAnswers.length === 0 && view){
            this.setState({ view: false})
        }
        if (Holder.length === 34 && hash.length !==0){
            this.setState({hash: ''})
        }
        
    } 
    
    handleChangeUsername(e) {
        this.setState({username: e.target.value});
    }
    handleChangePassword(e) {
        this.setState({password: e.target.value});
    }
    handleSubmit(){
        //Check the password
        const { password } = this.state;     
        if (!(password === 'blockchain')) {
            this.setState({ isLoggedIn: false }) 
            alert("Invalid Pasword")
        }
        //Check the USER in blockchain 
        if ((password === 'blockchain')) {
            this.fetchUser()
        }  
    }
    handleLogout() {
        this.setState({isLoggedIn : false, isUserValid: false, fhirUrl: '', username: '', password: '', 'items': [], 'hash': '', fetchURL: '', fhirResponse: '', selectedAnswers: [], Holder: 'Enter a valid Hash provided in the claim', view:  false})
    }
    handleChangeHash(e) {
        this.setState({hash: e.target.value});
    }
    handleSubmitQuery() {
        this.fetchURL();
    }
    //A Reset Button that that Refreshes for new Search
    reset(){
        this.setState({ fhirUrl: '', disableHashInput: false, 'items': [], 'hash': '', fhirResponse: '', selectedAnswers: [], Holder: 'Enter a valid Hash provided in the claim', view:  false})
    }

/**********************************
 * Fetch the data from blockchain
 **********************************/
    fetchData() {
      let config = {
        method: 'GET',
        headers: {
          'authorization': 'Bearer '+this.state.auth,
          'content-Type': 'application/json'
        },
      }
      fetch('http://'+this.state.hostIP+':4000' + '/channels/mychannel/chaincodes/pcr?peer=peer0.org1.example.com&fcn=queryCustom&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22_rev%5C%22:%5C%22'+this.state.hash+'%5C%22,%5C%22payerId%5C%22:%5C%22'+this.state.username+'%5C%22%7D%7D%22%5D', config)
        .then(response =>  response.json() )
        .then(response => {
            if (JSON.stringify(response) === '[]'){
               this.setState({ fetchError : 1})
               this.setState({ 'foutput' : 'failed'})
               this.setState({ 'items' : [] })
                
            } else {
                //this.setState({ fetchError : 2})
                
                this.setState({ fetchError : 2 ,'items' : response, fhirUrl: response.Record.fhirUrl , hash: '', Holder: this.state.hash ,disableHashInput: true })
            }
    } )
 
    }
/***********************************************************************
 * This fetches the USER in Blockchain network to authenticate the LOGIN
 ***********************************************************************/
    fetchUser() {
        let config = {
          method: 'GET',
          headers: {
            'authorization': 'Bearer '+this.state.auth,
            'content-Type': 'application/json'
          },
        }
       fetch('http://'+this.state.hostIP+':4000' + '/channels/mychannel/chaincodes/pcr?peer=peer0.org1.example.com&fcn=queryCustom&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22payerId%5C%22:%5C%22'+this.state.username+'%5C%22%7D%7D%22%5D', config)
            .then(response =>  response.text() )
            .then(response => {
                if (response.length > 20 ){
                    this.setState({ isUserValid : true , isLoggedIn: true})
                } else {
                    this.setState({ isUserValid : false })
                    alert("User did not registerd for Blockchain Service")  
                }
            } )
    }
/******************************************************************
 * Fetches data from the FHIR URl that recived from the blockchain 
 *****************************************************************/
    fetchURL() {
        const fhirUrl = this.state.fhirUrl
        let config = {
            method: 'GET',
            headers: {
              'Accept': 'application/json+fhir'
            },
          }
          fetch(fhirUrl, config)
            .then(response =>  response.json()  )
            .then((response) => this.setState({ fhirResponse : response.entry , totalFhirResponse: response}));
        
    } 



    render() {   
        const inputStyle ={ height: '35px', margin: 'auto', width: '100%'};
        const buttonStyle = { margin: 'auto' };
        const buttonStyle2 = { float : 'right'  };
        const feildStyle = { width: '100%', textAlign: 'right'};
        const fhirResponse = this.state.fhirResponse;
        const {view  , selectedAnswers} = this.state;

/********************************************************************************
 * Checkbox UI to select the key vlaues to be displayed and push selected elemets to array
 *********************************************************************************/      
        const checkBoxSelection = Object.entries(fhirResponse).map(key => 
            <div style={{margin: 'auto', position: 'relative',paddingLeft: '20px'}}>  
            <React.Fragment key={key}>
                <div style={{ width:'500px', margin:'auto', fontSize: '20px',  float: "right"}}>
                    <Checkbox id="Data" name="filter" disabled={this.state.view} labelText={key[1].resource.code.text} onChange={(e) => {
                        var jsonArg1 = new Object(); 
                        jsonArg1.name = key[1].resource.resourceType + key[1].resource.id; 
                        jsonArg1.value = key[1].resource.text.div;
                        jsonArg1.info = key[1].resource.meta.lastUpdated;
                        jsonArg1.patientInfo = key[1].resource.subject;
                        const { selectedAnswers } = this.state;
                        if (e.currentTarget.checked) {
                          selectedAnswers.push(jsonArg1);
                        } else if (!e.currentTarget.checked) {
                          selectedAnswers.splice(selectedAnswers.values(jsonArg1), 1);                       
                        }
                        this.setState({ selectedAnswers });  
                        }} />
                </div>
            </React.Fragment>
            </div>           
        )
        
/*******************************************************************************
 * Display the final output retrived from FHIR after checkbox filtering only Entry
 ********************************************************************************/ 
        let finalOutput;
        if (view &&  selectedAnswers.length>0){
            finalOutput = 
            <div style={{margin: '5px'}}>
                <Card >
                    <Card.Body >
                        <p><b>Additional Clinical Info:</b> </p>
                        {this.state.selectedAnswers.map(item => (
                        <React.Fragment key={item.name}>
                            <ul>
                                <div dangerouslySetInnerHTML={ {__html: item.value} } />
                                <p><b>Last Updated:</b> {item.info}</p>
                                <Divider/>
                            </ul>
                        </React.Fragment>))} 
                    </Card.Body>
                </Card>
            </div>
        } else {
            finalOutput = <div>
            </div>
        }

/**************************************************************************************************
 * Dispaly the Button that fetches the fhirURL on Succsessfull retrivel of Fhir Url from blockchain
 **************************************************************************************************/
        let url;
        const {fhirUrl, hash} = this.state;
        if (fhirUrl.length > 10) {
            url = <Button color="success" size="lg" onClick={this.handleSubmitQuery} text="Search" variant="action" style={{ margin: '5px'}} /> 
        } 
        //If cant fetch blockchain error is displayed saying invalid hash
        else if  (fhirUrl.length <10 && hash.length> 33) {
            url = <div>
                <LabelValueView >
                    <ItemDisplay text="Invalid or UnAuthorised Hash" textStyle="attention" icon={<IconAlert />} />
                </LabelValueView>
            </div>
        }
        //After succsess full fetch  
        if (fhirResponse.length >2) {
            url =   <Button color="success" size="lg" onClick={this.reset} text="Reset" variant="action" style={{ margin: '5px'}} />    
            
        }

/********************************************************************
 * View Button displayed only after a minimum of one filter selected
 *******************************************************************/
        let  viewButton;
        if (selectedAnswers.length > 0) {
            viewButton =
            <div style= {{ position: 'relative'}}>
                <Button color="success" size="lg" onClick={() => {const x = this.state.view; this.setState( { view : !x})}} text="View" variant="action" style={buttonStyle} />
            </div>
            
        } else {
            viewButton = <div>
             
            </div>
        }

/****************
 * Login Page UI
 ****************/
        const logInPage =  <div  style={{ margin: 'auto', height: '500px', width: '400px', textAlign:'left', position:'relative'}}> 
            <ul>  </ul>
            <div style={{ border: '1px solid lightGray', backgroundColor: '#2481ca', width: '100%', height: '50px', position: 'relative', }} >
                <ApplicationMenuName title="Login" />
            </div>
            <Card>
                <Card.Body>  
                    <ul>
                        <Input type="text" placeholder ="PayerID" value={this.state.username} onChange={this.handleChangeUsername} required  style={inputStyle}/> 
                    </ul>
                    <ul>
                        <Input type="password" placeholder ="Password" value={this.state.password} onChange={this.handleChangePassword} required  style={inputStyle}/>
                    </ul>
                    <div style={{ margin: 'auto', textAlign:'center'}}>
                        <Button  onClick={this.handleSubmit} text="Submit" variant="action" style={buttonStyle} />
                    </div>                    
                </Card.Body>
            </Card>
        </div>
       
/***************
 * Main Page UI 
 ***************/     
        const mainPage  = <div>  
            <DynamicGrid defaultTemplate={template}>
                <DynamicGrid.Region defaultPosition={region3}>
                    <div style = {feildStyle}> 
                        <h3 >Welcome {this.state.username}</h3>
                    </div>
                    <div style = {buttonStyle2}> 
                        <Button  onClick={this.handleLogout} text="Log Out" variant="action" style={buttonStyle2} />
                    </div>
                </DynamicGrid.Region>
                <DynamicGrid.Region defaultPosition={region1}>
                    <div  style={{  height: '200px',  position:'absolute', paddingInlineStart: '50px'}}> 
                        <div  style={{ margin: 'auto', height: '200px', width:'500px'}}> 
                            <p><b>Query the Additional Clinical Information</b></p>
                            Hash : <Input required type="text" placeholder ={this.state.Holder} value={this.state.hash}  onChange={this.handleChangeHash}  style={{ margin: 'auto', width: '320px', height: '35px'}}/>                      
                            {url}
                        </div>
                        {checkBoxSelection}
                        <div style={{ float: "right"}}>
                            {viewButton}
                        </div>   
                    </div>
                </DynamicGrid.Region>
                <DynamicGrid.Region defaultPosition={region2}>
                    {finalOutput}
                </DynamicGrid.Region>
            </DynamicGrid>    
        </div>

/*******************
 * Login Validation
 ********************/
        let result;
        const {isUserValid} = this.state;
        if (isUserValid) {
            result =   mainPage 
        } else {
            result = logInPage
           
        }

/***********************************
 * Returning the Rendered Elements
 *************************************/  
      return (
        <div>
            <div style={{ border: '1px solid lightGray', backgroundColor: '#2481ca', width: '100%', height: '50px', position: 'relative', }} >      
                <ApplicationMenuName title="Payer Chart Review" accessory={<Image src={img} height="80px" width="80px" isFluid />} />
            </div>
           {result}
         </div>
      );
    }
}
export default Main;
