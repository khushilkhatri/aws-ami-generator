# AWS AMI Generator

```javascript
const BaseNameAMI = "Base Name Instance Backup"; // <-- Required
// ^^^ Please keep this field unique because this function will
// try to delete images once total number of image crossed
// using basename base name
const TotalNumberOfImage = 32; // <-- Required Total number of backup should stored
const InstanceId = "i-xxxxxxxxxxxxxx"; // <-- required EC2 Instance ID
```

## Configurations

Copy `index.js` file and paste it in your created lambda function.

Add lambda role with EC2 instance.

This function will automatically delete previously generated images with the same base name.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
