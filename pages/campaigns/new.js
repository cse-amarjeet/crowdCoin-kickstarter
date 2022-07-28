import React, { Component } from "react";
import { Form, Button, Input, Message } from "semantic-ui-react";
import Layout from "../../components/Layout";
import "semantic-ui-css/semantic.min.css";
import factory from "../../ethereum/factory";
import web3 from "../../ethereum/web3";
import { Router } from "../../routes";

class CampaignNew extends Component {
  state = { minimumContribution: "", errorMassage: "", loading: false };
  ////////on Submit function
  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true, errorMassage: "" });
    try {
      const accounts = await web3.eth.getAccounts();
      await factory.methods
        .createCampaign(this.state.minimumContribution)
        .send({ from: accounts[0] });
      Router.pushRoute("/");
    } catch (err) {
      this.setState({ errorMassage: err.message });
    }
    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <h3>Create a Campaign</h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMassage}>
          <Form.Field>
            <label>Minimum Contribution</label>
            <Input
              label="Wei"
              labelPosition="right"
              value={this.state.minimumContribution}
              onChange={(e) =>
                this.setState({ minimumContribution: e.target.value })
              }
            />
          </Form.Field>
          <Message error header="Oops!!" content={this.state.errorMassage} />
          <Button loading={this.state.loading} primary>
            Create!
          </Button>
        </Form>
      </Layout>
    );
  }
}
export default CampaignNew;
