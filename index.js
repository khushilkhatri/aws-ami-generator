const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1"
});

const EC2 = new AWS.EC2({ apiVersion: "2016-11-15" });

const BaseNameAMI = "Base Name Instance Backup"; // <-- Required
// ^^^ Please keep this field unique because this function will
// try to delete images once total number of image crossed
// using basename base name
const TotalNumberOfImage = 32; // <-- Required Total number of backup should stored
const InstanceId = "i-xxxxxxxxxxxxxx"; // <-- required EC2 Instance ID

// Create a new AMI

async function createImage() {
  try {
    return await EC2.createImage({
      InstanceId, // Id of instance to create an image
      Name:
        BaseNameAMI +
        " " +
        new Date().toLocaleDateString("en-us", {
          month: "short",
          day: "numeric",
          timeZone: "UTC"
        }) +
        new Date().getTime(), // Name of image
      NoReboot: true // No-reboot before creating an image
    }).promise();
  } catch (err) {
    throw err;
  }
}

/**
 * This function will delete snapshot once
 * @param {any} {ImageId}
 */
async function deleteImageWithSnapshots({ ImageId }) {
  try {
    await EC2.deregisterImage({
      ImageId
    }).promise();

    // Fetch list of snapshots
    let data = await EC2.describeSnapshots({
      OwnerIds: ["self"]
    }).promise();

    // Delete snapshots of particular AMI
    data = data.Snapshots.filter(d => d.Description.indexOf(ImageId) !== -1);
    console.log(data);
    for (let i = 0; i < data.length; i++) {
      try {
        await EC2.deleteSnapshot({
          SnapshotId: data[i].SnapshotId
        }).promise();
      } catch (err) {
        console.log("err deleting snaps", err);
      }
    }

    console.log(
      `Deleted image id ${ImageId} at ${new Date().toLocaleDateString("en-us", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: "UTC"
      })}`
    );
  } catch (err) {
    console.log("error deleteing image", err);
    throw err;
  }
}

// const main = async () => {
exports.handler = async () => {
  console.log("triggered");
  try {
    // If need image id of created image use this function
    const { ImageId } = await createImage();

    console.log(
      `created image id ${ImageId} at ${new Date().toLocaleDateString("en-us", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: "UTC"
      })}`
    );
    // Fetch list of AMI
    let { Images } = await EC2.describeImages({
      Owners: ["self"]
    }).promise();

    Images = Images.filter(d => d.Name.indexOf(BaseNameAMI) !== -1);
    Images = Images.sort(
      (first, second) =>
        new Date(first.CreationDate).getTime() -
        new Date(second.CreationDate).getTime()
    );
    // console.log(Images.map((image) => image.Name))
    if (Images.length >= TotalNumberOfImage) {
      console.log(Images[0]);
      await deleteImageWithSnapshots(Images[0]);
    }
  } catch (err) {
    console.log(err);
  }
};
